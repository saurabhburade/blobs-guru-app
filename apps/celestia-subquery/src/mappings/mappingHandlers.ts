import {
  CosmosEvent,
  CosmosBlock,
  CosmosMessage,
  CosmosTransaction,
} from "@subql/types-cosmos";
import { getDecodedTxData } from "../utils/decodeBlockTx";
import { BlobData, BlockData, TransactionData } from "../types/models";

import { handleNewPriceMinute } from "./pricefeed/savePrices";
import {
  handleAccount,
  handleAccountDayData,
  handleAccountHourData,
} from "./entities/accountData";
import {
  handleApp,
  handleAppDayData,
  handleAppHourData,
} from "./entities/appData";
import {
  handleCollective,
  handleCollectiveDayData,
  handleCollectiveHourData,
} from "./entities/collectiveData";
/*
export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you want to index each block in Cosmos (CosmosHub), you could do that here
}
*/
export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you want to index each block in Cosmos (CosmosHub), you could do that here
  const height = block?.block?.header.height;

  const txs = block.transactions;

  const blockHash = block.blockId.hash;
  const priceData = await handleNewPriceMinute({ block });

  logger.info(`BLOCK ::  ${height} ::: PRICE :: ${priceData?.nativePrice}`);

  let bdata = BlockData.create({
    id: height.toString(),
    avgNativePrice: priceData?.nativePrice!,
    currentNativePrice: priceData?.nativePrice!,
    hash: block.block.id,
    height: height,
    proposer: block.header.proposerAddress.toString(),
    totalBlobSize: 0,
    totalBlobTransactionCount: 0,
    totalBlockFeeNatve: 0,
    totalBlockFeeUSD: 0,
    totalEventsCount: 0,
    totalSquareSize: 0,
    totalTransactionCount: block.txs.length,
    timestamp: block.header.time.getTime(),
  });
  let txnRecords: TransactionData[] = [];
  const blobs: BlobData[] = [];

  const appEntities = [];
  const appDayDatas = [];
  const appHourDatas = [];

  const accountEntities = [];
  const accountDayDatas = [];
  const accountHourDatas = [];

  const collectiveDataEntities = [];
  const collectiveDayDatas = [];
  const collectiveHourDatas = [];
  // logger.info(`BEFORE HANDLE TRANSACTIONS LOOP`);
  for (let idx = 0; idx < txs.length; idx++) {
    const tx = txs[idx];
    const decodedTx = getDecodedTxData(tx, idx);
    const collectiveData = await handleCollective(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0
    );
    const collectiveDayData = await handleCollectiveDayData(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0,
      collectiveData
    );
    const collectiveHourData = await handleCollectiveHourData(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0,
      collectiveData
    );

    collectiveDataEntities.push(collectiveData);
    collectiveDayDatas.push(collectiveDayData);
    collectiveHourDatas.push(collectiveHourData);

    const transactionRecord = TransactionData.create({
      id: tx.hash,
      blockHeightId: height.toString(),
      code: tx.tx.code,
      gasUsed: Number(tx.tx.gasUsed) || 0,
      gasWanted: Number(tx.tx.gasWanted) || 0,
      codespace: tx.tx.codespace || "",
      denomination: "tia",
      amount: decodedTx.txFee,
      hash: tx.hash,
      isBlobTransaction: decodedTx?.totalBytes > 0 ? true : false,
      nDataSubs: decodedTx.nDataSubs,
      nMessages: decodedTx.nMessages,
      index: tx.idx,
      totalBytes: decodedTx.totalBytes,
      nEvents: decodedTx.nEvents,
      txFeeNative: decodedTx.txFee,
      signerId: decodedTx.signer,
      // blockHeight: BigInt(block.block.header.height),
      timestamp: block.block.header.time.getTime(),
      txFeeUSD: Number(decodedTx.txFee) * (priceData?.nativePrice || 0),
      messages: decodedTx?.msgs || [],
    });
    txnRecords.push(transactionRecord);

    bdata.totalBlockFeeNatve += decodedTx.txFee;
    bdata.totalBlockFeeUSD +=
      Number(decodedTx.txFee) * (priceData?.nativePrice || 0);
    bdata.totalTransactionCount += 1;
    bdata.totalEventsCount += decodedTx.nEvents;
    if (decodedTx.blobs && decodedTx.blobs.length > 0) {
      // logger.info(`BEFORE BLOB DA UPDATES`);
      bdata.totalBlobSize += decodedTx.totalBytes;
      bdata.totalBlobTransactionCount += 1;

      for (let idx2 = 0; idx2 < decodedTx.blobs.length; idx2++) {
        const blob = decodedTx.blobs[idx2];
        const bEntity = BlobData.create({
          id: `${height}-${blob?.commitment}`,
          data: "",
          namespaceID: blob?.namespace || "",
          // namespaceId: blob.namespace || "",
          transactionId: transactionRecord.id || "",
          namespaceVersion: blob.shareVersion || 0,
          shareVersion: blob.shareVersion || 0,
          commitment: blob.commitment || "",
          size: blob?.blob_size || 0,
          signer: decodedTx.signer || "",
          index: idx2,
        });
        const appEntity = await handleApp(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          0,
          bEntity
        );

        // await handleAccount(decodedTx, priceData!, block, 1, appEntity);

        const appDayData = await handleAppDayData(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          0,
          appEntity,
          bEntity
        );
        const appHourData = await handleAppHourData(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          0,
          appEntity,
          bEntity
        );
        appEntities.push(appEntity);
        appDayDatas.push(appDayData);
        appHourDatas.push(appHourData);
        blobs.push(bEntity);

        // associated app account
        const accountEntity = await handleAccount(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          1,
          appEntity
        );
        const accDayData = await handleAccountDayData(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          1,
          appEntity
        );
        const accHrData = await handleAccountHourData(
          decodedTx,
          priceData!,
          {
            height: block.header.height,
            timestamp: block.header.time.getTime(),
          },
          1,
          appEntity
        );
        accountEntities.push(accountEntity);
        accountDayDatas.push(accDayData);
        accountHourDatas.push(accHrData);
      }
      // logger.info(`AFTER BLOB DA UPDATES`);
    }

    const accountEntity = await handleAccount(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0
    );
    const accDayData = await handleAccountDayData(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0
    );
    const accHrData = await handleAccountHourData(
      decodedTx,
      priceData!,
      {
        height: block.header.height,
        timestamp: block.header.time.getTime(),
      },
      0
    );
    accountEntities.push(accountEntity);
    accountDayDatas.push(accDayData);
    accountHourDatas.push(accHrData);
    // promises.push(handleAccount(decodedTx, priceData!, block, 0));

    // logger.info(`Bytes ::  ${decodedTx?.totalBytes}`);
    // logger.info(`nNamespaces ::  ${decodedTx.namespaces?.length}`);
    // logger.info(`nEvents ::   ${decodedTx.decodedEvents?.length}`);
    // logger.info(`nMsg ::   ${decodedTx.nMessages}`);
    // logger.info(`TxFee ::   ${decodedTx.txFee}`);
  }
  // logger.info(`AFTER HANDLE TRANSACTIONS LOOP`);

  // logger.info(`BEFORE BULK UPDATES`);

  // logger.info(`BEFORE BULK UPDATES :: COLLECTIVE`);
  // await store.bulkUpdate("CollectiveData", collectiveDataEntities);
  // await store.bulkUpdate("CollectiveDayData", collectiveDayDatas);
  // await store.bulkUpdate("CollectiveHourData", collectiveHourDatas);
  await Promise.all([
    store.bulkUpdate("CollectiveData", collectiveDataEntities),
    store.bulkUpdate("CollectiveDayData", collectiveDayDatas),
    store.bulkUpdate("CollectiveHourData", collectiveHourDatas),
    store.bulkUpdate("AppEntity", appEntities),
    store.bulkUpdate("AppDayData", appDayDatas),
    store.bulkUpdate("AppHourData", appHourDatas),
    store.bulkUpdate("AccountEntity", accountEntities),
    store.bulkUpdate("AccountDayData", accountDayDatas),
    store.bulkUpdate("AccountHourData", accountHourDatas),
    store.bulkUpdate("BlobData", blobs),
    store.bulkUpdate("TransactionData", txnRecords),
    bdata.save(),
  ]);
  // await store.bulkUpdate("TransactionData", txnRecords);
  // await store.bulkUpdate("BlobData", blobs);

  // await store.bulkUpdate("CollectiveData", collectiveDataEntities);
  // await store.bulkUpdate("CollectiveDayData", collectiveDayDatas);
  // await store.bulkUpdate("CollectiveHourData", collectiveHourDatas);
  // // logger.info(`BEFORE BULK UPDATES :: APPS`);
  // await store.bulkUpdate("AppEntity", appEntities);
  // await store.bulkUpdate("AppDayData", appDayDatas);
  // await store.bulkUpdate("AppHourData", appHourDatas);
  // // logger.info(`BEFORE BULK UPDATES :: ACCOUNTS`);
  // await store.bulkUpdate("AccountEntity", accountEntities);
  // await store.bulkUpdate("AccountDayData", accountDayDatas);
  // await store.bulkUpdate("AccountHourData", accountHourDatas);
  // // logger.info(`BEFORE BULK UPDATES:: BLOBS | TXNS`);
  // await bdata.save();
  // logger.info(`AFTER BULK UPDATES`);
}
