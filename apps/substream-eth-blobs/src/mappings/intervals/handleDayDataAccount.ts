import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Account,
  AccountDayData,
  BlobTransaction,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { ONE_BD, ZERO_BD } from "../../utils/constants";

export function handleAccountDayData(
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
      let dayID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(86400));
      let pdayID = BigInt.fromI64(timestamp.seconds)
        .minus(BigInt.fromI32(86400))
        .div(BigInt.fromI32(86400));

      let dayStartTimestamp = dayID.times(BigInt.fromI32(86400));
      let prevdayStartTimestamp = pdayID.times(BigInt.fromI32(86400));
      let blobsDayID = account.id
        .toString()
        .concat("-")
        .concat(dayID.toString());
      let blobsDayIDPrev = account.id
        .toString()
        .concat("-")
        .concat(pdayID.toString());
      let accountDayData = AccountDayData.load(blobsDayID);
      let accountDayDataPrev = AccountDayData.load(blobsDayIDPrev);
      if (accountDayData === null) {
        accountDayData = new AccountDayData(blobsDayID);
        accountDayData.totalBlobTransactionCount = ZERO_BD;
        accountDayData.totalGasEth = ZERO_BD;
        accountDayData.totalValue = ZERO_BD;
        accountDayData.totalValueEth = ZERO_BD;
        accountDayData.totalGasUsed = ZERO_BD;
        accountDayData.totalCumulativeGasUsed = ZERO_BD;
        accountDayData.totalBlobGas = ZERO_BD;
        accountDayData.totalBlobGasFeeCap = ZERO_BD;
        accountDayData.totalBlobHashesCount = ZERO_BD;
        accountDayData.totalBlobGasEth = ZERO_BD;
        accountDayData.totalFeeEth = ZERO_BD;
        accountDayData.totalBlobBlocks = ZERO_BD;
        accountDayData.dayStartTimestamp = new BigDecimal(dayStartTimestamp);
        accountDayData.account = account.id;
        accountDayData.totalGasUSD = ZERO_BD;
        accountDayData.totalFeeUSD = ZERO_BD;
        accountDayData.totalValueUSD = ZERO_BD;
        accountDayData.totalBlobGasUSD = ZERO_BD;
        accountDayData.currentEthPrice = ZERO_BD;
        accountDayData.totalFeeBurnedETH = ZERO_BD;
        accountDayData.totalFeeBurnedUSD = ZERO_BD;
        accountDayData.dayStartBlock = blockNumber;
      }

      // if (
      //   account.accountDayData === null ||
      //   account.accountDayData!.length === 0
      // ) {
      //   account.accountDayData = [accountDayData!.id!.toString()];
      // }
      // if (account.accountDayData !== null) {
      //   const dayDatas = account.accountDayData;
      //   if (dayDatas && dayDatas!.length > 0) {
      //     dayDatas.push(accountDayData!.id!.toString());
      //     account.accountDayData = dayDatas;
      //   }
      // }
      account.save();
      accountDayData.account = account.id;

      if (accountDayDataPrev !== null) {
        accountDayData.previousAccountDayData = accountDayDataPrev.id;
      }

      accountDayData.totalBlobTransactionCount =
        accountDayData.totalBlobTransactionCount.plus(ONE_BD);

      accountDayData.totalGasEth = accountDayData.totalGasEth.plus(
        totalGasEth!
      );
      accountDayData.totalFeeEth = accountDayData.totalFeeEth.plus(
        totalFeeEth!
      );
      accountDayData.totalValue = accountDayData.totalValue.plus(totalValue!);
      accountDayData.totalValueEth = accountDayData.totalValueEth.plus(
        totalValueEth!
      );
      accountDayData.totalGasUsed = accountDayData.totalGasUsed.plus(
        totalGasUsed!
      );
      accountDayData.totalCumulativeGasUsed =
        accountDayData.totalCumulativeGasUsed.plus(totalCumulativeGasUsed!);

      accountDayData.totalBlobGas = accountDayData.totalBlobGas.plus(
        totalBlobGas!
      );
      accountDayData.totalBlobGasFeeCap =
        accountDayData.totalBlobGasFeeCap.plus(totalBlobGasFeeCap!);
      accountDayData.totalBlobHashesCount =
        accountDayData.totalBlobHashesCount.plus(totalBlobHashesCount!);
      accountDayData.totalBlobGasEth = accountDayData.totalBlobGasEth.plus(
        totalBlobGasEth!
      );
      accountDayData.totalGasUSD = accountDayData.totalGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accountDayData.totalFeeUSD = accountDayData.totalFeeUSD.plus(
        totalFeeEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accountDayData.totalValueUSD = accountDayData.totalValueUSD.plus(
        totalValueEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accountDayData.totalBlobGasUSD = accountDayData.totalBlobGasUSD.plus(
        totalBlobGasEth!.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
      accountDayData.currentEthPrice = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      );
      if (blk.header !== null) {
        if (blk.header!.baseFeePerGas !== null) {
          const baseFeePerGasHex = Bytes.fromUint8Array(
            blk.header!.baseFeePerGas!.bytes!
          ).toHexString();
          const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
          accountDayData.totalFeeBurnedETH =
            accountDayData.totalFeeBurnedETH.plus(
              BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
                txn.gasUsed!
              )
            );
          accountDayData.totalFeeBurnedUSD =
            accountDayData.totalFeeBurnedUSD.plus(
              accountDayData.totalFeeBurnedETH.times(
                BigDecimal.fromString(blk.ethPriceChainlink.toString())
              )
            );
        }
      }
      const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
      if (accountDayData.lastUpdatedBlock !== null) {
        if (blocknumber.equals(accountDayData.lastUpdatedBlock!)) {
          accountDayData.lastUpdatedBlock = accountDayData.lastUpdatedBlock!;
        } else {
          accountDayData.lastUpdatedBlock = blocknumber;
          accountDayData.totalBlobBlocks =
            accountDayData.totalBlobBlocks!.plus(ONE_BD);
        }
      } else {
        accountDayData.lastUpdatedBlock = blocknumber;
        accountDayData.totalBlobBlocks =
          accountDayData.totalBlobBlocks!.plus(ONE_BD);
      }
      accountDayData.save();
    }
  }
}
