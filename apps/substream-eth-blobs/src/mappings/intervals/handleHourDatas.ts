import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  BlobsDayData,
  BlobsHourData,
  BlobTransaction,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import { ONE_BD, ZERO_BD } from "../../utils/constants";

export function handleBlobsHourData(txn: BlobTransaction, blk: Block): void {
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
      //   const hourIndex = timestamp / 3600; // get unique hour within unix history
      //   const hourStartUnix = hourIndex * 3600; // want the rounded effect
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
        blobsHourData.hourStartBlock = blockNumber;
      }
      if (blobsHourDataPrev !== null) {
        blobsHourData.previousBlobsHourData = blobsHourDataPrev.id;
      }

      blobsHourData.totalBlobTransactionCount =
        blobsHourData.totalBlobTransactionCount.plus(ONE_BD);

      blobsHourData.totalGasEth = blobsHourData.totalGasEth.plus(totalGasEth!);
      blobsHourData.totalFeeEth = blobsHourData.totalFeeEth.plus(totalFeeEth!);
      blobsHourData.totalValue = blobsHourData.totalValue.plus(totalValue!);
      blobsHourData.totalValueEth = blobsHourData.totalValueEth.plus(
        totalValueEth!
      );
      blobsHourData.totalGasUsed = blobsHourData.totalGasUsed.plus(
        totalGasUsed!
      );
      blobsHourData.totalCumulativeGasUsed =
        blobsHourData.totalCumulativeGasUsed.plus(totalCumulativeGasUsed!);

      blobsHourData.totalBlobGas = blobsHourData.totalBlobGas.plus(
        totalBlobGas!
      );
      blobsHourData.totalBlobGasFeeCap = blobsHourData.totalBlobGasFeeCap.plus(
        totalBlobGasFeeCap!
      );
      blobsHourData.totalBlobHashesCount =
        blobsHourData.totalBlobHashesCount.plus(totalBlobHashesCount!);
      blobsHourData.totalBlobGasEth = blobsHourData.totalBlobGasEth.plus(
        totalBlobGasEth!
      );
      blobsHourData.totalGasUSD = blobsHourData.totalGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsHourData.totalFeeUSD = blobsHourData.totalFeeUSD.plus(
        totalFeeEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsHourData.totalValueUSD = blobsHourData.totalValueUSD.plus(
        totalValueEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsHourData.totalBlobGasUSD = blobsHourData.totalBlobGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      blobsHourData.currentEthPrice = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      );
      blobsHourData.avgEthPrice = blobsHourData.avgEthPrice
        .plus(BigDecimal.fromString(blk.ethPriceChainlink.toString()))
        .div(BigDecimal.fromString("2"));
      if (blk.header !== null) {
        if (blk.header!.baseFeePerGas !== null) {
          const baseFeePerGasHex = Bytes.fromUint8Array(
            blk.header!.baseFeePerGas!.bytes!
          ).toHexString();
          const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
          blobsHourData.totalFeeBurnedETH =
            blobsHourData.totalFeeBurnedETH.plus(
              BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
                txn.gasUsed!
              )
            );
          blobsHourData.totalFeeBurnedUSD =
            blobsHourData.totalFeeBurnedUSD.plus(
              blobsHourData.totalFeeBurnedETH.times(
                BigDecimal.fromString(blk.ethPriceChainlink.toString())
              )
            );
        }
      }
      const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
      if (blobsHourData.lastUpdatedBlock !== null) {
        if (blocknumber.equals(blobsHourData.lastUpdatedBlock!)) {
          blobsHourData.lastUpdatedBlock = blobsHourData.lastUpdatedBlock!;
        } else {
          blobsHourData.lastUpdatedBlock = blocknumber;
          blobsHourData.totalBlobBlocks =
            blobsHourData.totalBlobBlocks!.plus(ONE_BD);
        }
      } else {
        blobsHourData.lastUpdatedBlock = blocknumber;
        blobsHourData.totalBlobBlocks =
          blobsHourData.totalBlobBlocks!.plus(ONE_BD);
      }
      blobsHourData.save();
    }
  }
}
