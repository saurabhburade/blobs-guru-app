import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Account,
  AccountHourData,
  AccountHourData,
  BlobTransaction,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { ONE_BD, ZERO_BD } from "../../utils/constants";

export function handleAccountHourData(
  txn: BlobTransaction,
  blk: Block,
  account: Account
): void {
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
      let hourID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(3600));
      let phourID = BigInt.fromI64(timestamp.seconds)
        .minus(BigInt.fromI32(3600))
        .div(BigInt.fromI32(3600));

      let hourStartTimestamp = hourID.times(BigInt.fromI32(3600));
      let prevHourStartTimestamp = phourID.times(BigInt.fromI32(3600));
      let blobsHourID = account.id
        .toString()
        .concat("-")
        .concat(hourID.toString());
      let blobsHourIDPrev = account.id
        .toString()
        .concat("-")
        .concat(phourID.toString());
      let accounHourData = AccountHourData.load(blobsHourID);
      let accounHourDataPrev = AccountHourData.load(blobsHourIDPrev);
      if (accounHourData === null) {
        accounHourData = new AccountHourData(blobsHourID);
        accounHourData.totalBlobTransactionCount = ZERO_BD;
        accounHourData.totalGasEth = ZERO_BD;
        accounHourData.totalValue = ZERO_BD;
        accounHourData.totalValueEth = ZERO_BD;
        accounHourData.totalGasUsed = ZERO_BD;
        accounHourData.totalCumulativeGasUsed = ZERO_BD;
        accounHourData.totalBlobGas = ZERO_BD;
        accounHourData.totalBlobGasFeeCap = ZERO_BD;
        accounHourData.totalBlobHashesCount = ZERO_BD;
        accounHourData.totalBlobGasEth = ZERO_BD;
        accounHourData.totalFeeEth = ZERO_BD;
        accounHourData.totalBlobBlocks = ZERO_BD;
        accounHourData.hourStartTimestamp = new BigDecimal(hourStartTimestamp);
        accounHourData.account = account.id;
        accounHourData.totalGasUSD = ZERO_BD;
        accounHourData.totalFeeUSD = ZERO_BD;
        accounHourData.totalValueUSD = ZERO_BD;
        accounHourData.totalBlobGasUSD = ZERO_BD;
        accounHourData.currentEthPrice = ZERO_BD;
        accounHourData.totalFeeBurnedETH = ZERO_BD;
        accounHourData.totalFeeBurnedUSD = ZERO_BD;
        accounHourData.hourStartBlock = blockNumber;
      }
      // if (
      //   account.accountHourData === null ||
      //   account.accountHourData!.length === 0
      // ) {
      //   account.accountHourData = [accounHourData!.id!.toString()];
      // }
      // if (account.accountHourData !== null) {
      //   const hourlyDatas = account.accountHourData;
      //   if (hourlyDatas && hourlyDatas!.length > 0) {
      //     hourlyDatas.push(accounHourData!.id!.toString());
      //     account.accountHourData = hourlyDatas;
      //   }
      // }
      account.save();
      accounHourData.account = account.id;
      if (accounHourDataPrev !== null) {
        accounHourData.previousAccountHourData = accounHourDataPrev.id;
      }

      accounHourData.totalBlobTransactionCount =
        accounHourData.totalBlobTransactionCount.plus(ONE_BD);

      accounHourData.totalGasEth = accounHourData.totalGasEth.plus(
        totalGasEth!
      );
      accounHourData.totalFeeEth = accounHourData.totalFeeEth.plus(
        totalFeeEth!
      );
      accounHourData.totalValue = accounHourData.totalValue.plus(totalValue!);
      accounHourData.totalValueEth = accounHourData.totalValueEth.plus(
        totalValueEth!
      );
      accounHourData.totalGasUsed = accounHourData.totalGasUsed.plus(
        totalGasUsed!
      );
      accounHourData.totalCumulativeGasUsed =
        accounHourData.totalCumulativeGasUsed.plus(totalCumulativeGasUsed!);

      accounHourData.totalBlobGas = accounHourData.totalBlobGas.plus(
        totalBlobGas!
      );
      accounHourData.totalBlobGasFeeCap =
        accounHourData.totalBlobGasFeeCap.plus(totalBlobGasFeeCap!);
      accounHourData.totalBlobHashesCount =
        accounHourData.totalBlobHashesCount.plus(totalBlobHashesCount!);
      accounHourData.totalBlobGasEth = accounHourData.totalBlobGasEth.plus(
        totalBlobGasEth!
      );
      accounHourData.totalGasUSD = accounHourData.totalGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accounHourData.totalFeeUSD = accounHourData.totalFeeUSD.plus(
        totalFeeEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accounHourData.totalValueUSD = accounHourData.totalValueUSD.plus(
        totalValueEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accounHourData.totalBlobGasUSD = accounHourData.totalBlobGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accounHourData.currentEthPrice = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      );
      if (blk.header !== null) {
        if (blk.header!.baseFeePerGas !== null) {
          const baseFeePerGasHex = Bytes.fromUint8Array(
            blk.header!.baseFeePerGas!.bytes!
          ).toHexString();
          const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
          accounHourData.totalFeeBurnedETH =
            accounHourData.totalFeeBurnedETH.plus(
              BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
                txn.gasUsed!
              )
            );
          accounHourData.totalFeeBurnedUSD =
            accounHourData.totalFeeBurnedUSD.plus(
              accounHourData.totalFeeBurnedETH.times(
                BigDecimal.fromString(blk.ethPriceChainlink.toString())
              )
            );
        }
      }
      const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
      if (accounHourData.lastUpdatedBlock !== null) {
        if (blocknumber.equals(accounHourData.lastUpdatedBlock!)) {
          accounHourData.lastUpdatedBlock = accounHourData.lastUpdatedBlock!;
        } else {
          accounHourData.lastUpdatedBlock = blocknumber;
          accounHourData.totalBlobBlocks =
            accounHourData.totalBlobBlocks!.plus(ONE_BD);
        }
      } else {
        accounHourData.lastUpdatedBlock = blocknumber;
        accounHourData.totalBlobBlocks =
          accounHourData.totalBlobBlocks!.plus(ONE_BD);
      }
      accounHourData.save();
    }
  }
}
