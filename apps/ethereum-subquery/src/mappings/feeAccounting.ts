export type ExactFeeTotals = {
  executionFeesWei?: bigint;
  blobFeesWei?: bigint;
};

export function calculateReceiptFees(receipt: {
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  blobGasUsed: bigint;
  blobGasPrice: bigint;
}) {
  const executionFeeWei = receipt.gasUsed * receipt.effectiveGasPrice;
  const blobFeeWei = receipt.blobGasUsed * receipt.blobGasPrice;
  return {
    executionFeeWei,
    blobFeeWei,
  };
}

export function addExactFees(
  entity: ExactFeeTotals,
  executionFeeWei: bigint,
  blobFeeWei: bigint,
): void {
  // Old Float rows have no exact starting balance. Leave them null until reindexed.
  if (entity.executionFeesWei == null || entity.blobFeesWei == null) {
    return;
  }
  entity.executionFeesWei += executionFeeWei;
  entity.blobFeesWei += blobFeeWei;
}
