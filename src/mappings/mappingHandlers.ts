import { EthereumBlock } from "@subql/types-ethereum";
import {
  AccountEntity,
  BlobData,
  BlockData,
  CollectiveData,
  TransactionData,
} from "../types";

import {
  BYTES_PER_BLOB,
  fakeExponential,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
} from "../utils";
import {
  handleAccount,
  handleAccountDayData,
  handleAccountHourData,
} from "./entities/accountData";
import { handleNewPriceMinute } from "./pricefeed/savePrices";
import {
  handleCollective,
  handleCollectiveDayData,
  handleCollectiveHourData,
} from "./entities/collectiveData";
import { getTxReceipts } from "./handleReceipts";
const BLOB_BASE_FEE_UPDATE_FRACTION = 3338477;

export async function handleBlock(block: EthereumBlock): Promise<void> {
  const priceData = await handleNewPriceMinute({ block });
  const receipts = await getTxReceipts({ block });
  logger.info(`PRICE DATA FOUND ::  ${priceData?.nativePrice}`);
  logger.info(`RECEIPT DATA FOUND ::  ${receipts?.size}`);
  logger.info(`BLOCK ::: ${block.number}`);
  const transactions = block.transactions;
  const accountsToSave = [];
  const accountDayDatas = [];
  const accountHourDatas = [];

  const collectiveDataEntities = [];
  const collectiveDayDatas = [];
  const collectiveHourDatas = [];

  const blobs: BlobData[] = [];
  let txnRecords: TransactionData[] = [];

  let bdata = BlockData.create({
    id: block.number.toString(),
    avgNativePrice: priceData?.nativePrice!,
    currentNativePrice: priceData?.nativePrice!,
    hash: block.hash,
    height: BigInt(block.number),
    proposer: block.miner,
    totalBlobSize: 0,
    totalBlobTransactionCount: 0,
    totalBlockFeeNatve: 0,
    totalBlockFeeUSD: 0,
    totalDAFeeNatve: 0,
    totalDAFeeUSD: 0,
    totalEventsCount: block.logs.length,
    totalSquareSize: 0,
    totalTransactionCount: transactions.length,
    timestamp: Number(block.timestamp) * 1000,
  });
  const baseBlobGasPrice = fakeExponential(
    1,
    Number(block.excessBlobGas),
    BLOB_BASE_FEE_UPDATE_FRACTION
  );
  for (let index = 0; index < transactions.length; index++) {
    const txn = transactions[index];

    if (txn.type === "0x3") {
      const dataSubmissionSize =
        (txn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;
      const receipt =
        receipts?.get((txn.hash as string).toLowerCase()) ??
        (await txn.receipt());
      txn.gas = BigInt((receipt.gasUsed ?? 0)?.toString()) || txn.gas;
      txn.gasPrice =
        BigInt((receipt.effectiveGasPrice ?? 0)?.toString()) || txn.gas;
      const fees =
        Number(receipt?.gasUsed) * Number(receipt?.effectiveGasPrice);
      const feesUSD = fees * priceData!.nativePrice;

      const feesDA =
        (baseBlobGasPrice || 1) *
        Number(txn.blobVersionedHashes?.length) *
        BYTES_PER_BLOB;
      const feesUSDDA = feesDA * priceData!.nativePrice;

      const transactionToSave = TransactionData.create({
        id: txn.hash,
        amount: Number(txn.value),

        hash: txn.hash,
        isBlobTransaction: txn.type === "0x3" ? true : false,
        nDataSubs: txn?.blobVersionedHashes?.length || 0,
        nEvents: txn?.logs?.length || 0,
        timestamp: BigInt(Number(block.timestamp) * 1000),
        totalBytes: dataSubmissionSize,
        txFeeNative: fees,
        blockHeightId: block.number.toString(),
        signerId: txn.from,
        lastPriceFeedId: priceData!.id,
        totalDAFeeNatve: feesDA,
        totalDAFeeUSD: feesUSDDA,
        totalFeeNatve: fees,
        totalFeeUSD: feesUSD,
      });
      txnRecords.push(transactionToSave);
      bdata.totalBlobSize += dataSubmissionSize;
      bdata.totalBlockFeeNatve += fees;
      bdata.totalBlockFeeUSD += feesUSD;

      bdata.totalDAFeeNatve += feesDA;
      bdata.totalDAFeeUSD += feesUSDDA;
      bdata.totalBlobTransactionCount += 1;
      const acc = await handleAccount(txn, priceData!, {
        height: block.number,
        timestamp: Number(block.timestamp) * 1000,
        baseBlobGasPrice: baseBlobGasPrice,
      });
      accountsToSave.push(acc);

      const accDayData = await handleAccountDayData(txn, priceData!, {
        height: block.number,
        timestamp: Number(block.timestamp) * 1000,
        baseBlobGasPrice: baseBlobGasPrice,
      });
      accountDayDatas.push(accDayData);

      const accHourData = await handleAccountHourData(txn, priceData!, {
        height: block.number,
        timestamp: Number(block.timestamp) * 1000,
        baseBlobGasPrice: baseBlobGasPrice,
      });
      accountHourDatas.push(accHourData);

      // const collectiveData =
      await handleCollective(txn, priceData!, {
        height: block.number,
        timestamp: Number(block.timestamp) * 1000,
        baseBlobGasPrice: baseBlobGasPrice,
      });
      // const collectiveDayData =
      //   await handleCollectiveDayData(
      //   txn,
      //   priceData!,
      //   {
      //     height: block.number,
      //     timestamp: Number(block.timestamp) * 1000,
      //   },

      //   collectiveData
      // );
      // const collectiveHourData = await handleCollectiveHourData(
      //   txn,
      //   priceData!,
      //   {
      //     height: block.number,
      //     timestamp: Number(block.timestamp) * 1000,
      //   },

      //   collectiveData
      // );

      // collectiveDataEntities.push(collectiveData);
      // collectiveDayDatas.push(collectiveDayData);
      // collectiveHourDatas.push(collectiveHourData);

      let hashes: string[] = [];

      if (txn.blobVersionedHashes) {
        for (let index = 0; index < txn.blobVersionedHashes.length; index++) {
          const blobHashRaw = txn.blobVersionedHashes[index];
          const blobHash = blobHashRaw;
          // hashes.push(blobHash);
          const blob = BlobData.create({
            id: blobHash,

            signerId: txn.from,
            size: BYTES_PER_BLOB,

            transactionId: txn.hash,
            blockHeightId: block.number.toString(),
          });
          blobs.push(blob);
        }
      }
    } else {
      // logger.info(`SKIP ::: NON BLOB TRANSACTION :: ${txn.hash}`);
      // const account = await AccountEntity.get(txn.from);
      // if (account && account !== null) {
      //   // save  account datas for other txns
      //   const acc = await handleAccount(txn, priceData!, {
      //     height: block.number,
      //     timestamp: Number(block.timestamp) * 1000,
      //   });
      //   accountsToSave.push(acc);
      //   const accDayData = await handleAccountDayData(txn, priceData!, {
      //     height: block.number,
      //     timestamp: Number(block.timestamp) * 1000,
      //   });
      //   accountDayDatas.push(accDayData);
      //   const accHourData = await handleAccountHourData(txn, priceData!, {
      //     height: block.number,
      //     timestamp: Number(block.timestamp) * 1000,
      //   });
      //   accountHourDatas.push(accHourData);
      // }
    }
  }

  await Promise.all([
    // store.bulkUpdate("CollectiveData", collectiveDataEntities),
    // store.bulkUpdate("CollectiveDayData", collectiveDayDatas),
    // store.bulkUpdate("CollectiveHourData", collectiveHourDatas),

    store.bulkUpdate("AccountEntity", accountsToSave),
    store.bulkUpdate("AccountDayData", accountDayDatas),
    store.bulkUpdate("AccountHourData", accountHourDatas),

    store.bulkUpdate("BlobData", blobs),
    store.bulkUpdate("TransactionData", txnRecords),
    bdata.save(),
  ]);
  // await bdata.save(), await store.bulkUpdate("AccountEntity", accountsToSave);
  // await store.bulkUpdate("AccountDayData", accountDayDatas);
  // await store.bulkUpdate("AccountHourData", accountHourDatas);

  // await store.bulkUpdate("BlobData", blobs);
  // await store.bulkUpdate("TransactionData", txnRecords);

  // await store.bulkUpdate("CollectiveData", collectiveDataEntities);
  // await store.bulkUpdate("CollectiveDayData", collectiveDayDatas);
  // await store.bulkUpdate("CollectiveHourData", collectiveHourDatas);
  // // await bdata.save();
}
