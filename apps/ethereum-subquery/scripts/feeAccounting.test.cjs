const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(
  path.join(__dirname, "../src/mappings/feeAccounting.ts"),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const feeAccounting = { exports: {} };
new Function("module", "exports", compiled.outputText)(
  feeAccounting,
  feeAccounting.exports,
);
const { calculateReceiptFees, addExactFees } = feeAccounting.exports;

test("receipt fees use actual gas and retain every wei", () => {
  const fees = calculateReceiptFees({
    gasUsed: 21608n,
    effectiveGasPrice: 20633085521n,
    blobGasUsed: 131072n,
    blobGasPrice: 43624038916n,
  });
  assert.deepEqual(fees, {
    executionFeeWei: 445839711937768n,
    blobFeeWei: 5717890028797952n,
  });
  assert.equal(fees.executionFeeWei + fees.blobFeeWei, 6163729740735720n);
});

test("aggregates retain values past Number.MAX_SAFE_INTEGER", () => {
  const totals = {
    executionFeesWei: 0n,
    blobFeesWei: 0n,
  };
  addExactFees(totals, 24789487878309010n, 262144n);
  addExactFees(totals, 1n, 2n);
  assert.deepEqual(totals, {
    executionFeesWei: 24789487878309011n,
    blobFeesWei: 262146n,
  });
  assert.equal(
    totals.executionFeesWei + totals.blobFeesWei,
    24789487878571157n,
  );
});

test("legacy aggregate stays null until its history is reindexed", () => {
  const totals = {};
  addExactFees(totals, 10n, 20n);
  assert.deepEqual(totals, {});
});
