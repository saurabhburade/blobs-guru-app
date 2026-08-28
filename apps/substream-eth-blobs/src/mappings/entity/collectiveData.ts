import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BlobTransaction, CollectiveData } from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import { ONE_BD, ONE_BI, ZERO_BD, ZERO_BI } from "../../utils/constants";
import { handleBlobsDayData } from "../intervals/handleDayDatas";
import { handleBlobsHourData } from "../intervals/handleHourDatas";

export function handleBlobsCollective(txn: BlobTransaction, blk: Block): void {
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
  //   let totalGasEth = ZERO_BD;
  //     if (txn.gasUsed !== null && ) {
  //   }
  const totalGasEth = txn.gasUsed!.times(txn.gasPrice!) || ZERO_BD;
  const totalBlobGasEth = txn.blobGas!.times(txn.blobGasPrice!) || ZERO_BD;
  const totalFeeEth = txn.gasUsed!.times(txn.gasPrice!) || ZERO_BD;
  const totalValue = txn.value || ZERO_BD;
  const totalValueEth = txn.value || ZERO_BD;
  const totalGasUsed = txn.gasUsed || ZERO_BD;
  const totalCumulativeGasUsed = txn.cumulativeGasUsed || ZERO_BD;
  const totalBlobGas = txn.blobGas || ZERO_BD;
  const totalBlobGasFeeCap = txn.blobGasFeeCap || ZERO_BD;
  const totalBlobHashesCount = txn.blobHashesLength || ZERO_BD;
  collectiveData.totalBlobTransactionCount =
    collectiveData.totalBlobTransactionCount.plus(ONE_BD);

  collectiveData.totalGasEth = collectiveData.totalGasEth.plus(totalGasEth!);
  collectiveData.totalFeeEth = collectiveData.totalFeeEth.plus(totalFeeEth!);
  collectiveData.totalValue = collectiveData.totalValue.plus(totalValue!);
  collectiveData.totalValueEth = collectiveData.totalValueEth.plus(
    totalValueEth!
  );
  collectiveData.totalGasUsed = collectiveData.totalGasUsed.plus(totalGasUsed!);
  collectiveData.totalCumulativeGasUsed =
    collectiveData.totalCumulativeGasUsed.plus(totalCumulativeGasUsed!);

  collectiveData.totalBlobGas = collectiveData.totalBlobGas.plus(totalBlobGas!);
  collectiveData.totalBlobGasFeeCap = collectiveData.totalBlobGasFeeCap.plus(
    totalBlobGasFeeCap!
  );
  collectiveData.totalBlobHashesCount =
    collectiveData.totalBlobHashesCount.plus(totalBlobHashesCount!);
  collectiveData.totalBlobGasEth = collectiveData.totalBlobGasEth.plus(
    totalBlobGasEth!
  );
  collectiveData.totalGasUSD = collectiveData.totalGasUSD.plus(
    totalBlobGasEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  collectiveData.totalFeeUSD = collectiveData.totalFeeUSD.plus(
    totalFeeEth!.times(BigDecimal.fromString(blk.ethPriceChainlink.toString()))
  );
  collectiveData.totalValueUSD = collectiveData.totalValueUSD.plus(
    totalValueEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  collectiveData.totalBlobGasUSD = collectiveData.totalBlobGasUSD.plus(
    totalBlobGasEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
  if (collectiveData.lastUpdatedBlock !== null) {
    if (blocknumber.equals(collectiveData.lastUpdatedBlock!)) {
      collectiveData.lastUpdatedBlock = collectiveData.lastUpdatedBlock!;
    } else {
      collectiveData.lastUpdatedBlock = blocknumber;
      collectiveData.totalBlobBlocks =
        collectiveData.totalBlobBlocks!.plus(ONE_BD);
    }
  } else {
    collectiveData.lastUpdatedBlock = blocknumber;
    collectiveData.totalBlobBlocks =
      collectiveData.totalBlobBlocks!.plus(ONE_BD);
  }
  collectiveData.currentEthPrice = BigDecimal.fromString(
    blk.ethPriceChainlink.toString()
  );
  collectiveData.avgEthPrice = collectiveData.avgEthPrice
    .plus(BigDecimal.fromString(blk.ethPriceChainlink.toString()))
    .div(BigDecimal.fromString("2"));
  if (blk.header !== null) {
    if (blk.header!.baseFeePerGas !== null) {
      const baseFeePerGasHex = Bytes.fromUint8Array(
        blk.header!.baseFeePerGas!.bytes!
      ).toHexString();
      const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
      collectiveData.totalFeeBurnedETH = collectiveData.totalFeeBurnedETH.plus(
        BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
          txn.gasUsed!
        )
      );
      collectiveData.totalFeeBurnedUSD = collectiveData.totalFeeBurnedUSD.plus(
        collectiveData.totalFeeBurnedETH.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
    }
  }
  // BLOBS DAY DATAS
  handleBlobsDayData(txn, blk);
  handleBlobsHourData(txn, blk);

  // let blobsDayData =

  collectiveData.save();
}
