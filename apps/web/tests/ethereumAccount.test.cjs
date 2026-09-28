const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");
const { buildSchema, executeSync, validate } = require("graphql");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

// Load the real query documents and component without a Next.js test server.
function loadSource(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const loaded = new Module(filename, module);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = (name) => mocks[name] ?? originalRequire(name);
  loaded._compile(
    ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
  return loaded.exports;
}

const queries = loadSource("src/lib/apollo/queriesEthereum.ts");
const storedId = "0x5050F69a9786F081509234F1a7F4684b5E5b76C9";
const hash = `0x${"a".repeat(64)}`;
const account = { id: storedId, totalTxnCount: 37646 };
const transaction = {
  id: hash,
  hash: `\\x${hash.slice(2)}`,
  timestamp: "1716359339000",
  signerId: storedId,
  totalBytes: 131072,
  totalDAFeeNatve: 1000000000,
  blobFeeWei: "1000000001",
  nEvents: 1,
};

function schema(exactFees = false) {
  return buildSchema(`
    input StringFilter { likeInsensitive: String equalTo: String includesInsensitive: String }
    input AccountFilter { id: StringFilter }
    input TransactionFilter { signerId: StringFilter }
    input DayFilter { accountId: StringFilter }
    enum Order { TIMESTAMP_DESC TIMESTAMP_LAST_DESC }
    type AccountEntity {
      id: String totalByteSize: Float totalFees: Float totalTxnCount: Float
      totalDAFees: Float endBlock: Float startBlock: Float
      totalDataSubmissionCount: Float totalFeesUSD: Float
      totalDAFeesUSD: Float totalFeesNative: Float
      ${exactFees ? "executionFeesWei: String blobFeesWei: String" : ""}
    }
    type TransactionDatum {
      id: String hash: String timestamp: String txFeeNative: Float
      totalDAFeeNatve: Float blockHeightId: String nEvents: Int
      totalBytes: Float signerId: String blobs: BlobConnection
      ${exactFees ? "blobFeeWei: String" : ""}
    }
    type Blob { signerId: String size: Float }
    type BlobConnection { nodes: [Blob!]! }
    type AccountDayDatum {
      id: String totalTxnCount: Float totalFees: Float timestampLast: String
      timestampStart: String totalFeesUSD: Float totalByteSize: Float
      accountId: String totalDataSubmissionCount: Float totalDAFeesUSD: Float
      totalFeesNative: Float totalDAFees: Float
    }
    type AccountConnection { nodes: [AccountEntity!]! }
    type TransactionConnection { nodes: [TransactionDatum!]! }
    type DayConnection { nodes: [AccountDayDatum!]! totalCount: Int }
    type Query {
      accountEntities(filter: AccountFilter, first: Int): AccountConnection
      transactionData(filter: TransactionFilter, first: Int, offset: Int, orderBy: Order): TransactionConnection
      accountDayData(filter: DayFilter, first: Int, orderBy: Order): DayConnection
    }
  `);
}

function render({
  exactFees = false,
  accountError = false,
  missing = false,
  transactionError = false,
} = {}) {
  const apiSchema = schema(exactFees);
  const rootValue = {
    accountEntities: ({ filter }) => {
      if (accountError) throw new Error("API unavailable");
      const matches =
        filter.id.likeInsensitive.toLowerCase() === storedId.toLowerCase();
      return { nodes: !missing && matches ? [account] : [] };
    },
    transactionData: ({ filter }) => {
      if (transactionError) throw new Error("Transactions unavailable");
      return {
        nodes: filter.signerId.equalTo === storedId ? [transaction] : [],
      };
    },
  };
  const operations = [];
  const useQuery = (document, options = {}) => {
    operations.push(document.definitions[0].name.value);
    const errors = validate(apiSchema, document);
    const result = errors.length
      ? { errors }
      : executeSync({
          schema: apiSchema,
          document,
          rootValue,
          variableValues: options.variables,
        });
    return {
      data: result.data,
      error: result.errors?.[0],
      loading: false,
      refetch: async () => result,
    };
  };
  const empty = () => null;
  const component = loadSource("src/views/Ethereum/SingleAccount.tsx", {
    "@apollo/client": { useQuery },
    "@/lib/apollo/client": { apolloClient: {} },
    "@/lib/apollo/queriesEthereum": queries,
    "@/components/Footer/Footer": empty,
    "@/components/Header/Header": empty,
    "@/components/Sidebar/Sidebar": empty,
    "@/components/Skeletons/TransactionRowSkeleton": empty,
    "../Home/components/PoweredBy": empty,
    "./Apps/AppStats/L2Beat/L2BeatCard": empty,
    "./components/AccountStats/AccountStatCard": ({ acc }) =>
      React.createElement(
        "p",
        null,
        `Transactions Count: ${acc?.totalTxnCount}`,
      ),
    "./components/AccountStats/AccountStats": ({ account: id }) =>
      React.createElement("p", null, `DA Stats: ${id}`),
    "next/link": ({ children, ...props }) =>
      React.createElement("a", props, children),
    "@/lib/time": { timeAgo: (date) => date.toISOString() },
    "@/lib/utils": {
      formatAddress: (value) => value,
      formatBytes: String,
      parseEthHashString: (value) => value.replace("\\x", "0x"),
    },
  }).default;
  return {
    html: renderToStaticMarkup(
      React.createElement(component, { account: storedId.toLowerCase() }),
    ),
    operations,
  };
}

test("account, charts, and transactions validate against the legacy API schema", () => {
  for (const document of [
    queries.ETHEREUM_ACCOUNT_SINGLE_QUERY,
    queries.ETHEREUM_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
    queries.ETHEREUM_USER_TRANSACTIONS_FILTER_LIMIT_QUERY,
  ]) {
    assert.deepEqual(validate(schema(), document), []);
  }
});

test("different address capitalization still renders account stats and transactions", () => {
  const { html, operations } = render();
  assert.match(html, /Transactions Count: 37646/);
  assert.match(html, new RegExp(`DA Stats: ${storedId}`));
  assert.equal(html.split(`href="/ethereum/txn/${hash}"`).length - 1, 2);
  assert.match(html, /2024-05-22T06:28:59.000Z/);
  assert.doesNotMatch(html, /No indexed|Unable to load/);
  assert.ok(!operations.includes("AccountEntityWithExactFees"));
});

test("upgraded APIs use exact fee fields without losing account or transaction data", () => {
  const { html, operations } = render({ exactFees: true });
  assert.match(html, /Transactions Count: 37646/);
  assert.match(html, /0.000000001000000001 ETH/);
  assert.ok(operations.includes("AccountEntityWithExactFees"));
  assert.ok(operations.includes("TransactionDataWithExactFees"));
});

test("account failures show Retry instead of claiming the account is syncing", () => {
  const { html } = render({ accountError: true });
  assert.match(html, /role="alert"/);
  assert.match(html, /Unable to load this account/);
  assert.match(html, />Retry<\/button>/);
  assert.doesNotMatch(html, /No indexed|sync this account/);
});

test("missing accounts show an empty state with Refresh", () => {
  const { html } = render({ missing: true });
  assert.match(html, /No indexed blob transactions found/);
  assert.match(html, />Refresh<\/button>/);
  assert.doesNotMatch(html, /Unable to load|Transactions Count/);
});

test("transaction failures show a retry while keeping account stats visible", () => {
  const { html } = render({ transactionError: true });
  assert.match(html, /Transactions Count: 37646/);
  assert.match(html, /Unable to load transactions/);
  assert.match(html, />Retry transactions<\/button>/);
  assert.doesNotMatch(html, /No transactions found/);
});
