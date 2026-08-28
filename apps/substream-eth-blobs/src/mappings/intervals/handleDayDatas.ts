import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Account,
  BlobsDayData,
  BlobTransaction,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import { ONE_BD, ZERO_BD } from "../../utils/constants";

export function handleBlobsDayData(txn: BlobTransaction, blk: Block): void {
  const totalGasEth = txn.cumulativeGasUsed!.times(txn.gasPrice!) || ZERO_BD;
  const totalBlobGasEth = txn.blobGas!.times(txn.blobGasPrice!) || ZERO_BD;
  const totalFeeEth = txn.gasUsed!.times(txn.gasPrice!) || ZERO_BD;
  const totalValue = txn.value || ZERO_BD;
  const totalValueEth = txn.value || ZERO_BD;
  const totalGasUsed = txn.gasUsed || ZERO_BD;
  const totalCumulativeGasUsed = txn.cumulativeGasUsed || ZERO_BD;
  const totalBlobGas = txn.blobGas || ZERO_BD;
  const totalBlobGasFeeCap = txn.blobGasFeeCap || ZERO_BD;
  const totalBlobHashesCount = txn.blobHashesLength || ZERO_BD;
  const blockNumber = new BigDecimal(BigInt.fromU64(blk.number));

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
        blobsDayData.dayStartBlock = blockNumber;

        blobsDayData.totalTransactionCount = ZERO_BD;
        blobsDayData.totalTransactionCountLegacy = ZERO_BD;
        blobsDayData.totalTransactionCountAccessList = ZERO_BD;
        blobsDayData.totalTransactionCountDynamicFee = ZERO_BD;
      }
      if (blobsDayDataPrev !== null) {
        blobsDayData.previousBlobsDayData = blobsDayDataPrev.id;
      }

      blobsDayData.totalBlobTransactionCount =
        blobsDayData.totalBlobTransactionCount.plus(ONE_BD);

      blobsDayData.totalGasEth = blobsDayData.totalGasEth.plus(totalGasEth!);
      blobsDayData.totalFeeEth = blobsDayData.totalFeeEth.plus(totalFeeEth!);
      blobsDayData.totalValue = blobsDayData.totalValue.plus(totalValue!);
      blobsDayData.totalValueEth = blobsDayData.totalValueEth.plus(
        totalValueEth!
      );
      blobsDayData.totalGasUsed = blobsDayData.totalGasUsed.plus(totalGasUsed!);
      blobsDayData.totalCumulativeGasUsed =
        blobsDayData.totalCumulativeGasUsed.plus(totalCumulativeGasUsed!);

      blobsDayData.totalBlobGas = blobsDayData.totalBlobGas.plus(totalBlobGas!);
      blobsDayData.totalBlobGasFeeCap = blobsDayData.totalBlobGasFeeCap.plus(
        totalBlobGasFeeCap!
      );
      blobsDayData.totalBlobHashesCount =
        blobsDayData.totalBlobHashesCount.plus(totalBlobHashesCount!);
      blobsDayData.totalBlobGasEth = blobsDayData.totalBlobGasEth.plus(
        totalBlobGasEth!
      );
      blobsDayData.totalGasUSD = blobsDayData.totalGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsDayData.totalFeeUSD = blobsDayData.totalFeeUSD.plus(
        totalFeeEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsDayData.totalValueUSD = blobsDayData.totalValueUSD.plus(
        totalValueEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsDayData.totalBlobGasUSD = blobsDayData.totalBlobGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsDayData.currentEthPrice = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      );
      blobsDayData.avgEthPrice = blobsDayData.avgEthPrice
        .plus(BigDecimal.fromString(blk.ethPriceChainlink.toString()))
        .div(BigDecimal.fromString("2"));
      if (blk.header !== null) {
        if (blk.header!.baseFeePerGas !== null) {
          const baseFeePerGasHex = Bytes.fromUint8Array(
            blk.header!.baseFeePerGas!.bytes!
          ).toHexString();
          const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
          blobsDayData.totalFeeBurnedETH = blobsDayData.totalFeeBurnedETH.plus(
            BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
              txn.gasUsed!
            )
          );
          blobsDayData.totalFeeBurnedUSD = blobsDayData.totalFeeBurnedUSD.plus(
            blobsDayData.totalFeeBurnedETH.times(
              BigDecimal.fromString(blk.ethPriceChainlink.toString())
            )
          );
        }
      }
      const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
      if (blobsDayData.lastUpdatedBlock !== null) {
        if (blocknumber.equals(blobsDayData.lastUpdatedBlock!)) {
          blobsDayData.lastUpdatedBlock = blobsDayData.lastUpdatedBlock!;
        } else {
          blobsDayData.lastUpdatedBlock = blocknumber;
          blobsDayData.totalBlobBlocks =
            blobsDayData.totalBlobBlocks!.plus(ONE_BD);
        }
      } else {
        blobsDayData.lastUpdatedBlock = blocknumber;
        blobsDayData.totalBlobBlocks =
          blobsDayData.totalBlobBlocks!.plus(ONE_BD);
      }
      blobsDayData.save();
    }
  }
}
