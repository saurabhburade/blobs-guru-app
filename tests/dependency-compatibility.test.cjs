const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

const repository = path.join(__dirname, '..');
const apps = path.join(repository, 'apps');
const modulePaths = [
  path.join(repository, 'node_modules'),
  path.join(repository, 'node_modules', '.pnpm', 'node_modules'),
  ...fs.readdirSync(apps).map(app => path.join(apps, app, 'node_modules')),
];

function packageRoots(name) {
  const roots = [...new Set(modulePaths.map(directory => path.join(directory, name))
    .filter(root => fs.existsSync(path.join(root, 'package.json')))
    .map(root => fs.realpathSync(root)))];
  assert.ok(roots.length, `${name} must be installed`);
  return roots;
}

test('Wagmi 3 provides public clients and RPC reads without wallet connectors', async () => {
  const webRequire = createRequire(path.join(apps, 'web', 'package.json'));
  const wagmiEntry = webRequire.resolve('wagmi');
  const wagmiRequire = createRequire(wagmiEntry);
  const wagmi = await import(pathToFileURL(wagmiEntry).href);
  const { getPublicClient } = await import(pathToFileURL(wagmiRequire.resolve('@wagmi/core')).href);
  const { mainnet, sepolia } = await import(pathToFileURL(webRequire.resolve('viem/chains')).href);
  const { custom } = await import(pathToFileURL(webRequire.resolve('viem')).href);
  const requests = [];
  const config = wagmi.createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    transports: {
      [mainnet.id]: custom({ request: async ({ method }) => {
        requests.push(method);
        if (method === 'eth_blockNumber') return '0x10';
        throw new Error(`Unexpected RPC method: ${method}`);
      } }),
      [sepolia.id]: wagmi.http('http://127.0.0.1:8545'),
    },
  });
  assert.equal(config.connectors.length, 0);
  assert.equal(await getPublicClient(config, { chainId: mainnet.id }).getBlockNumber(), 16n);
  assert.deepEqual(requests, ['eth_blockNumber']);

  const React = webRequire('react');
  const { renderToString } = webRequire('react-dom/server');
  const { QueryClient, QueryClientProvider } = webRequire('@tanstack/react-query');
  function ClientProbe() {
    return React.createElement('span', null, `chain:${wagmi.usePublicClient().chain.id}`);
  }
  const html = renderToString(React.createElement(wagmi.WagmiProvider, { config },
    React.createElement(QueryClientProvider, { client: new QueryClient() }, React.createElement(ClientProbe))));
  assert.equal(html, '<span>chain:1</span>');
});

test('SubQuery can clone a local template using simple-git 4', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blobs-dependency-test-'));
  try {
    const source = path.join(directory, 'source');
    fs.mkdirSync(source);
    const git = args => execFileSync('git', args, { cwd: source, stdio: 'pipe' });
    git(['init', '--initial-branch=main']);
    fs.writeFileSync(path.join(source, 'README.md'), 'local template\n');
    git(['add', 'README.md']);
    git(['-c', 'user.name=Dependency Test', '-c', 'user.email=dependency-test@example.invalid',
      'commit', '-m', 'Local test fixture']);
    let index = 0;
    for (const root of packageRoots('@subql/cli')) {
      const { cloneProjectGit } = require(path.join(root, 'lib/controller/init-controller.js'));
      const destination = await cloneProjectGit(directory, `clone-${index++}`, source, 'main');
      assert.equal(fs.readFileSync(path.join(destination, 'README.md'), 'utf8'), 'local template\n');
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('SubQuery converts default, optional, array and enum schemas into working CLI flags', () => {
  for (const root of packageRoots('@subql/cli')) {
    const localRequire = createRequire(path.join(root, 'package.json'));
    const { z } = localRequire('zod');
    const { zodToFlags, zodToArgs } = require(path.join(root, 'lib/adapters/utils.js'));
    const flags = zodToFlags(z.object({
      output: z.string().default('dist'),
      quiet: z.boolean().default(false),
      limit: z.number().optional(),
      endpoint: z.array(z.string()).optional(),
      mode: z.enum(['fast', 'safe']).default('safe'),
    }));
    assert.equal(flags.output.default, 'dist');
    assert.equal(flags.quiet.default, false);
    assert.equal(flags.limit.required, false);
    assert.equal(flags.endpoint.multiple, true);
    assert.deepEqual(flags.mode.options, ['fast', 'safe']);
    assert.equal(flags.mode.default, 'safe');
    assert.equal(zodToArgs(z.object({ project: z.string().default('.') })).project.default, '.');
  }
});

test('ABI validation still accepts contracts and rejects invalid addresses', () => {
  for (const root of packageRoots('abitype')) {
    const localRequire = createRequire(path.join(root, 'package.json'));
    const { Abi, Address, TypedData } = localRequire('abitype/zod');
    assert.equal(Abi.safeParse([{ type: 'function', name: 'balanceOf', stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }]).success, true);
    assert.equal(Address.safeParse('0x0000000000000000000000000000000000000001').success, true);
    assert.equal(Address.safeParse('invalid').success, false);
    assert.equal(TypedData.safeParse({ Mail: [{ name: 'to', type: 'address' }] }).success, true);
    assert.equal(TypedData.safeParse({ Mail: [{ name: 'to', type: 'NotDefined' }] }).success, false);
  }
});

test('Cloudflare development adapter loads after the Miniflare upgrade', () => {
  for (const root of packageRoots('@cloudflare/next-on-pages')) {
    const adapter = require(path.join(root, 'dist/next-dev/index.cjs'));
    assert.equal(typeof adapter.setupDevPlatform, 'function');
  }
});

test('sharp can encode an image with the upgraded native library', async () => {
  for (const root of packageRoots('sharp')) {
    const sharp = require(root);
    const image = await sharp({ create: { width: 2, height: 2, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer({ resolveWithObject: true });
    assert.equal(image.info.format, 'png');
    assert.equal(image.info.width, 2);
    assert.equal(image.info.height, 2);
    assert.ok(image.data.length > 0);
  }
});

test('vm2 still runs mappings and blocks child_process under wildcard builtin access', () => {
  for (const root of packageRoots('vm2')) {
    const { VM, NodeVM } = require(root);
    assert.equal(new VM().run('40 + 2'), 42);
    assert.throws(() => new NodeVM({ require: { builtin: ['*'] } })
      .run("module.exports = require('child_process')", 'mapping.js'));
  }
});

test('Bitcoin block verification rejects duplicated transactions with the same Merkle root', () => {
  for (const root of packageRoots('bitcoinjs-lib')) {
    const { Block, Transaction } = require(root);
    const transactions = [1, 2, 3].map(value => {
      const transaction = new Transaction();
      transaction.addInput(Buffer.alloc(32, value), 0);
      transaction.addOutput(Buffer.from('6a', 'hex'), 0);
      return transaction;
    });
    const block = new Block();
    block.transactions = transactions;
    block.merkleRoot = Block.calculateMerkleRoot(transactions);
    assert.equal(block.checkTxRoots(), true);
    block.transactions = [...transactions, transactions[2]];
    assert.equal(block.checkTxRoots(), false);
  }
});
