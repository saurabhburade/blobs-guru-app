import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  BlobBlockData,
  BlobsDayData,
  BlobsHourData,
  CollectiveData,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import { ONE_BD, ONE_BI, ZERO_BD } from "../../utils/constants";

export function handleCollectiveDataOtherTxn(
  txn: TransactionTrace,
  blk: Block
): void {
  let collectiveData = CollectiveData.load(Bytes.fromI32(1));
  if (collectiveData === null) {
    collectiveData = new CollectiveData(Bytes.fromI32(1));
    collectiveData.totalBlobTransactionCount = ZERO_BD;
    collectiveData.totalValue = ZERO_BD;
    collectiveData.totalValueEth = ZERO_BD;
    collectiveData.totalGasEth = ZERO_BD;
    collectiveData.totalFeeEth = ZERO_BD;
    collectiveData.totalGasUsed = ZERO_BD;
    collectiveData.totalCumulativeGasUsed = ZERO_BD;
    collectiveData.totalBlobGas = ZERO_BD;
    collectiveData.totalBlobGasFeeCap = ZERO_BD;
    collectiveData.totalBlobHashesCount = ZERO_BD;
    collectiveData.totalBlobGasEth = ZERO_BD;
    collectiveData.totalBlobBlocks = ZERO_BD;
    collectiveData.totalFeeUSD = ZERO_BD;
    collectiveData.totalGasUSD = ZERO_BD;
    collectiveData.totalValueUSD = ZERO_BD;
    collectiveData.totalBlobGasUSD = ZERO_BD;
    collectiveData.avgEthPrice = ZERO_BD;
    collectiveData.currentEthPrice = ZERO_BD;
    collectiveData.totalFeeBurnedETH = ZERO_BD;

    collectiveData.totalFeeBurnedUSD = ZERO_BD;
    collectiveData.totalTransactionCount = ZERO_BD;
    collectiveData.totalTransactionCountLegacy = ZERO_BD;
    collectiveData.totalTransactionCountAccessList = ZERO_BD;
    collectiveData.totalTransactionCountDynamicFee = ZERO_BD;
  }

  collectiveData.totalTransactionCount =
    collectiveData.totalTransactionCount.plus(ONE_BD);
  if (txn.type === 0) {
    collectiveData.totalTransactionCountLegacy =
      collectiveData.totalTransactionCountLegacy.plus(ONE_BD);
  }
  if (txn.type === 1) {
    collectiveData.totalTransactionCountAccessList =
      collectiveData.totalTransactionCountAccessList.plus(ONE_BD);
  }
  if (txn.type === 2) {
    collectiveData.totalTransactionCountDynamicFee =
      collectiveData.totalTransactionCountDynamicFee.plus(ONE_BD);
  }
  handleCollectiveDataOtherTxnDayData(txn, blk);
  handleCollectiveDataOtherTxnHourData(txn, blk);
  handleBlobBlockTxns(txn, blk);
  collectiveData.save();
}

export function handleBlobBlockTxns(txn: TransactionTrace, blk: Block): void {
  const blockNumber = new BigDecimal(BigInt.fromU64(blk.number));
  const timestamp = blk.header!.timestamp!;
  let blobBlock = BlobBlockData.load(blockNumber.toString());
  if (blobBlock === null) {
    blobBlock = new BlobBlockData(blockNumber.toString());
    blobBlock.totalBlobTransactionCount = ZERO_BD;
    blobBlock.totalTransactionCount = ZERO_BD;

    blobBlock.totalValue = ZERO_BD;
    blobBlock.totalValueEth = ZERO_BD;
    blobBlock.totalGasEth = ZERO_BD;
    blobBlock.totalFeeEth = ZERO_BD;
    blobBlock.totalGasUsed = ZERO_BD;
    blobBlock.totalCumulativeGasUsed = ZERO_BD;
    blobBlock.totalBlobGas = ZERO_BD;
    blobBlock.totalBlobGasFeeCap = ZERO_BD;
    blobBlock.totalBlobHashesCount = ZERO_BD;
    blobBlock.totalBlobGasEth = ZERO_BD;
    blobBlock.blockNumber = blockNumber;
    blobBlock.size = new BigDecimal(BigInt.fromU64(blk.size));

    blobBlock.timestamp = new BigDecimal(BigInt.fromI64(timestamp.seconds));
    blobBlock.totalBlockFeeEth = ZERO_BD;
    blobBlock.totalBlockFeeUSD = ZERO_BD;
    blobBlock.totalGasUSD = ZERO_BD;
    blobBlock.totalFeeUSD = ZERO_BD;
    blobBlock.totalValueUSD = ZERO_BD;
    blobBlock.totalBlobGasUSD = ZERO_BD;
    blobBlock.currentEthPrice = ZERO_BD;
    blobBlock.avgEthPrice = ZERO_BD;
    blobBlock.totalFeeBurnedETH = ZERO_BD;
    blobBlock.totalFeeBurnedUSD = ZERO_BD;
    blobBlock.totalTransactionCountLegacy = ZERO_BD;
    blobBlock.totalTransactionCountAccessList = ZERO_BD;
    blobBlock.totalTransactionCountDynamicFee = ZERO_BD;
  }
  if (txn.type === 0) {
    blobBlock.totalTransactionCountLegacy =
      blobBlock.totalTransactionCountLegacy.plus(ONE_BD);
  }
  if (txn.type === 1) {
    blobBlock.totalTransactionCountAccessList =
      blobBlock.totalTransactionCountAccessList.plus(ONE_BD);
  }
  if (txn.type === 2) {
    blobBlock.totalTransactionCountDynamicFee =
      blobBlock.totalTransactionCountDynamicFee.plus(ONE_BD);
  }
  blobBlock.save();
}
export function handleCollectiveDataOtherTxnDayData(
  txn: TransactionTrace,
  blk: Block
): void {
  if (blk.header !== null && blk.header!.timestamp !== null) {
    let timestamp = blk.header!.timestamp!;
    if (timestamp !== null && timestamp.seconds !== null) {
      let dayID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(86400));
      let pdayID = BigInt.fromI64(timestamp.seconds)
        .minus(BigInt.fromI32(86400))
        .div(BigInt.fromI32(86400));

      let dayStartTimestamp = dayID.times(BigInt.fromI32(86400));
      let prevdayStartTimestamp = pdayID.times(BigInt.fromI32(86400));
      let blobsDayID = "BlobsDayData-"
        .toString()
        .concat("-")
        .concat(dayID.toString());
      let blobsDayIDPrev = "BlobsDayData-"
        .toString()
        .concat("-")
        .concat(pdayID.toString());
      let blobsDayData = BlobsDayData.load(blobsDayID);
      let blobsDayDataPrev = BlobsDayData.load(blobsDayIDPrev);
      if (blobsDayData === null) {
        blobsDayData = new BlobsDayData(blobsDayID);
        blobsDayData.totalBlobTransactionCount = ZERO_BD;
        blobsDayData.totalGasEth = ZERO_BD;
        blobsDayData.totalValue = ZERO_BD;
        blobsDayData.totalValueEth = ZERO_BD;
        blobsDayData.totalGasUsed = ZERO_BD;
        blobsDayData.totalCumulativeGasUsed = ZERO_BD;
        blobsDayData.totalBlobGas = ZERO_BD;
        blobsDayData.totalBlobGasFeeCap = ZERO_BD;
        blobsDayData.totalBlobHashesCount = ZERO_BD;
        blobsDayData.totalBlobGasEth = ZERO_BD;
        blobsDayData.totalFeeEth = ZERO_BD;
        blobsDayData.totalBlobBlocks = ZERO_BD;
        blobsDayData.dayStartTimestamp = new BigDecimal(dayStartTimestamp);
        blobsDayData.totalGasUSD = ZERO_BD;
        blobsDayData.totalFeeUSD = ZERO_BD;
        blobsDayData.totalValueUSD = ZERO_BD;
        blobsDayData.totalBlobGasUSD = ZERO_BD;
        blobsDayData.currentEthPrice = ZERO_BD;
        blobsDayData.avgEthPrice = ZERO_BD;
        blobsDayData.totalFeeBurnedETH = ZERO_BD;
        blobsDayData.totalFeeBurnedUSD = ZERO_BD;

        blobsDayData.totalTransactionCount = ZERO_BD;
        blobsDayData.totalTransactionCountLegacy = ZERO_BD;
        blobsDayData.totalTransactionCountAccessList = ZERO_BD;
        blobsDayData.totalTransactionCountDynamicFee = ZERO_BD;
      }
      blobsDayData.totalTransactionCount =
        blobsDayData.totalTransactionCount.plus(ONE_BD);
      if (blobsDayDataPrev !== null) {
        blobsDayData.previousBlobsDayData = blobsDayDataPrev.id;
      }
      if (txn.type === 0) {
        blobsDayData.totalTransactionCountLegacy =
          blobsDayData.totalTransactionCountLegacy.plus(ONE_BD);
      }
      if (txn.type === 1) {
        blobsDayData.totalTransactionCountAccessList =
          blobsDayData.totalTransactionCountAccessList.plus(ONE_BD);
      }
      if (txn.type === 2) {
        blobsDayData.totalTransactionCountDynamicFee =
          blobsDayData.totalTransactionCountDynamicFee.plus(ONE_BD);
      }
      blobsDayData.save();
    }
  }
}
export function handleCollectiveDataOtherTxnHourData(
  txn: TransactionTrace,
  blk: Block
): void {
  if (blk.header !== null && blk.header!.timestamp !== null) {
    let timestamp = blk.header!.timestamp!;
    if (timestamp !== null && timestamp.seconds !== null) {
      let hourID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(3600));
      let phourID = BigInt.fromI64(timestamp.seconds)
        .minus(BigInt.fromI32(3600))
        .div(BigInt.fromI32(3600));

      let hourStartTimestamp = hourID.times(BigInt.fromI32(3600));
      let prevHourStartTimestamp = phourID.times(BigInt.fromI32(3600));
      let blobsHourID = "BlobsHourData-"
        .toString()
        .concat("-")
        .concat(hourID.toString());
      let blobsHourIDPrev = "BlobsHourData-"
        .toString()
        .concat("-")
        .concat(phourID.toString());
      let blobsHourData = BlobsHourData.load(blobsHourID);
      let blobsHourDataPrev = BlobsHourData.load(blobsHourIDPrev);
      if (blobsHourData === null) {
        blobsHourData = new BlobsHourData(blobsHourID);
        blobsHourData.totalBlobTransactionCount = ZERO_BD;
        blobsHourData.totalGasEth = ZERO_BD;
        blobsHourData.totalValue = ZERO_BD;
        blobsHourData.totalValueEth = ZERO_BD;
        blobsHourData.totalGasUsed = ZERO_BD;
        blobsHourData.totalCumulativeGasUsed = ZERO_BD;
        blobsHourData.totalBlobGas = ZERO_BD;
        blobsHourData.totalBlobGasFeeCap = ZERO_BD;
        blobsHourData.totalBlobHashesCount = ZERO_BD;
        blobsHourData.totalBlobGasEth = ZERO_BD;
        blobsHourData.totalFeeEth = ZERO_BD;
        blobsHourData.totalBlobBlocks = ZERO_BD;
        blobsHourData.totalFeeUSD = ZERO_BD;
        blobsHourData.totalGasUSD = ZERO_BD;
        blobsHourData.totalValueUSD = ZERO_BD;
        blobsHourData.totalBlobGasUSD = ZERO_BD;
        blobsHourData.currentEthPrice = ZERO_BD;
        blobsHourData.avgEthPrice = ZERO_BD;
        blobsHourData.totalFeeBurnedETH = ZERO_BD;
        blobsHourData.totalFeeBurnedUSD = ZERO_BD;
        blobsHourData.hourStartTimestamp = new BigDecimal(hourStartTimestamp);
        blobsHourData.totalTransactionCount = ZERO_BD;
        blobsHourData.totalTransactionCountLegacy = ZERO_BD;
        blobsHourData.totalTransactionCountAccessList = ZERO_BD;
        blobsHourData.totalTransactionCountDynamicFee = ZERO_BD;
      }
      blobsHourData.totalTransactionCount =
        blobsHourData.totalTransactionCount.plus(ONE_BD);

      if (blobsHourDataPrev !== null) {
        blobsHourData.previousBlobsHourData = blobsHourDataPrev.id;
      }
      if (txn.type === 0) {
        blobsHourData.totalTransactionCountLegacy =
          blobsHourData.totalTransactionCountLegacy.plus(ONE_BD);
      }
      if (txn.type === 1) {
        blobsHourData.totalTransactionCountAccessList =
          blobsHourData.totalTransactionCountAccessList.plus(ONE_BD);
      }
      if (txn.type === 2) {
        blobsHourData.totalTransactionCountDynamicFee =
          blobsHourData.totalTransactionCountDynamicFee.plus(ONE_BD);
      }

      blobsHourData.save();
    }
  }
}
