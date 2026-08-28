import { BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Account,
  BlobBlockData,
  BlobsDayData,
  BlobsHourData,
  BlobTransaction,
  CollectiveData,
} from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import {
  ONE_BD,
  ONE_BI,
  TWO_BI,
  ZERO_BD,
  ZERO_BI,
} from "../../utils/constants";
import { handleBlobsDayData } from "../intervals/handleDayDatas";
import { handleBlobsHourData } from "../intervals/handleHourDatas";
import { handleAccountDayData } from "../intervals/handleDayDataAccount";
import { handleAccountHourData } from "../intervals/handleHourDataAccount";

export function handleBlobsAccount(
  txn: BlobTransaction,
  blk: Block,
  from: string,
  type: BigInt = ONE_BI
): void {
  log.info("FROM {}", [from]);
  log.info("type {}", [type.toString()]);
  log.info("FROM {} ::: Type {}", [from, type.toString()]);
  // const from = txn.from;
  const blockNumber = new BigDecimal(BigInt.fromU64(blk.number));

  let blobAccount = Account.load(Bytes.fromHexString(from));
  if (blobAccount === null) {
    blobAccount = new Account(Bytes.fromHexString(from));
    blobAccount.totalBlobTransactionCount = ZERO_BD;
    blobAccount.totalValue = ZERO_BD;
    blobAccount.totalValueEth = ZERO_BD;
    blobAccount.totalGasEth = ZERO_BD;
    blobAccount.totalFeeEth = ZERO_BD;
    blobAccount.totalGasUsed = ZERO_BD;
    blobAccount.totalCumulativeGasUsed = ZERO_BD;
    blobAccount.totalBlobGas = ZERO_BD;
    blobAccount.totalBlobGasFeeCap = ZERO_BD;
    blobAccount.totalBlobHashesCount = ZERO_BD;
    blobAccount.totalBlobGasEth = ZERO_BD;
    blobAccount.totalBlobBlocks = ZERO_BD;
    blobAccount.totalGasUSD = ZERO_BD;
    blobAccount.totalFeeUSD = ZERO_BD;
    blobAccount.totalValueUSD = ZERO_BD;
    blobAccount.totalBlobGasUSD = ZERO_BD;
    blobAccount.currentEthPrice = ZERO_BD;
    blobAccount.totalFeeBurnedETH = ZERO_BD;
    blobAccount.totalFeeBurnedUSD = ZERO_BD;
    blobAccount.startBlock = blockNumber;
    blobAccount.type = type;
    // blobAccount.accountDayData = [];
    // blobAccount.accountHourData = [];

    handleNewBlobsAccount(txn, blk);
  }

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
  blobAccount.totalBlobTransactionCount =
    blobAccount.totalBlobTransactionCount.plus(ONE_BD);

  blobAccount.totalGasEth = blobAccount.totalGasEth.plus(totalGasEth!);
  blobAccount.totalFeeEth = blobAccount.totalFeeEth.plus(totalFeeEth!);
  blobAccount.totalValue = blobAccount.totalValue.plus(totalValue!);
  blobAccount.totalValueEth = blobAccount.totalValueEth.plus(totalValueEth!);
  blobAccount.totalGasUsed = blobAccount.totalGasUsed.plus(totalGasUsed!);
  blobAccount.totalCumulativeGasUsed = blobAccount.totalCumulativeGasUsed.plus(
    totalCumulativeGasUsed!
  );

  blobAccount.totalBlobGas = blobAccount.totalBlobGas.plus(totalBlobGas!);
  blobAccount.totalBlobGasFeeCap = blobAccount.totalBlobGasFeeCap.plus(
    totalBlobGasFeeCap!
  );
  blobAccount.totalBlobHashesCount = blobAccount.totalBlobHashesCount.plus(
    totalBlobHashesCount!
  );
  blobAccount.totalBlobGasEth = blobAccount.totalBlobGasEth.plus(
    totalBlobGasEth!
  );
  blobAccount.totalGasUSD = blobAccount.totalGasUSD.plus(
    totalBlobGasEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  blobAccount.totalFeeUSD = blobAccount.totalFeeUSD.plus(
    totalFeeEth!.times(BigDecimal.fromString(blk.ethPriceChainlink.toString()))
  );
  blobAccount.totalValueUSD = blobAccount.totalValueUSD.plus(
    totalValueEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  blobAccount.totalBlobGasUSD = blobAccount.totalBlobGasUSD.plus(
    totalBlobGasEth!.times(
      BigDecimal.fromString(blk.ethPriceChainlink.toString())
    )
  );
  blobAccount.currentEthPrice = BigDecimal.fromString(
    blk.ethPriceChainlink.toString()
  );
  if (blk.header !== null) {
    if (blk.header!.baseFeePerGas !== null) {
      const baseFeePerGasHex = Bytes.fromUint8Array(
        blk.header!.baseFeePerGas!.bytes!
      ).toHexString();
      const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
      blobAccount.totalFeeBurnedETH = blobAccount.totalFeeBurnedETH.plus(
        BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
          txn.gasUsed!
        )
      );
      blobAccount.totalFeeBurnedUSD = blobAccount.totalFeeBurnedUSD.plus(
        blobAccount.totalFeeBurnedETH.times(
          BigDecimal.fromString(blk.ethPriceChainlink.toString())
        )
      );
    }
  }
  const blocknumber = new BigDecimal(BigInt.fromU64(blk.number));
  if (blobAccount.lastUpdatedBlock !== null) {
    if (blocknumber.equals(blobAccount.lastUpdatedBlock!)) {
      blobAccount.lastUpdatedBlock = blobAccount.lastUpdatedBlock!;
    } else {
      blobAccount.lastUpdatedBlock = blocknumber;
      blobAccount.totalBlobBlocks = blobAccount.totalBlobBlocks!.plus(ONE_BD);
    }
  } else {
    blobAccount.lastUpdatedBlock = blocknumber;
    blobAccount.totalBlobBlocks = blobAccount.totalBlobBlocks!.plus(ONE_BD);
  }
  handleAccountDayData(txn, blk, blobAccount);
  handleAccountHourData(txn, blk, blobAccount);
  blobAccount.save();
}

export function handleNewBlobsAccount(
  txn: BlobTransaction,
  blk: Block,
  type: BigInt = ONE_BI
): void {
  const blockNumber = new BigDecimal(BigInt.fromU64(blk.number));
  let collectiveData = CollectiveData.load(Bytes.fromI32(1));
  if (collectiveData !== null) {
    if (collectiveData.totalBlobAccounts === null) {
      collectiveData.totalBlobAccounts = ZERO_BD;
    }
    if (collectiveData.totalValidatorAccounts === null) {
      collectiveData.totalValidatorAccounts = ZERO_BD;
    }
    if (type === ONE_BI) {
      collectiveData.totalBlobAccounts =
        collectiveData.totalBlobAccounts!.plus(ONE_BD);
    }
    if (type === TWO_BI) {
      collectiveData.totalValidatorAccounts =
        collectiveData.totalValidatorAccounts!.plus(ONE_BD);
    }

    collectiveData.save();
  }

  let blobBlock = BlobBlockData.load(blockNumber.toString());
  if (blobBlock !== null) {
    if (blobBlock.totalBlobAccounts === null) {
      blobBlock.totalBlobAccounts = ZERO_BD;
    }
    blobBlock.totalBlobAccounts = blobBlock.totalBlobAccounts!.plus(ONE_BD);
    blobBlock.save();
  }
  if (blk.header !== null && blk.header!.timestamp !== null) {
    let timestamp = blk.header!.timestamp!;
    if (timestamp !== null && timestamp.seconds !== null) {
      let dayID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(86400));
      let hourID = BigInt.fromI64(timestamp.seconds).div(BigInt.fromI32(3600));
      let blobsDayID = "BlobsDayData-"
        .toString()
        .concat("-")
        .concat(dayID.toString());
      let blobsHourID = "BlobsHourData-"
        .toString()
        .concat("-")
        .concat(hourID.toString());
      let blobsDayData = BlobsDayData.load(blobsDayID);
      let blobsHourData = BlobsHourData.load(blobsHourID);
      if (blobsDayData !== null) {
        if (blobsDayData.totalBlobAccounts === null) {
          blobsDayData.totalBlobAccounts = ZERO_BD;
        }
        blobsDayData.totalBlobAccounts =
          blobsDayData.totalBlobAccounts!.plus(ONE_BD);
        blobsDayData.save();
      }
      if (blobsHourData !== null) {
        if (blobsHourData.totalBlobAccounts === null) {
          blobsHourData.totalBlobAccounts = ZERO_BD;
        }
        blobsHourData.totalBlobAccounts =
          blobsHourData.totalBlobAccounts!.plus(ONE_BD);
        blobsHourData.save();
      }
    }
  }
}
