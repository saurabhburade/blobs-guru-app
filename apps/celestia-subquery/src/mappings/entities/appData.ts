"use strict";

import {
  AppDayData,
  AppEntity,
  AppHourData,
  BlobData,
  PriceFeedMinute,
} from "../../types";

import { CosmosBlock } from "@subql/types-cosmos";
import { TxStats } from "../../utils/decodeBlockTx";

import { handleAccount } from "./accountData";

export async function handleApp(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  type: number = 0,
  blob: BlobData
) {
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = blob.namespaceID!;

    let appEntity = await AppEntity.get(id);

    if (appEntity === undefined || appEntity === null) {
      appEntity = AppEntity.create({
        id: id,
        name: Buffer.from(id, "hex").toString("ascii"),
        owner: decodedTxn.signer,
        creationRawData: JSON.stringify({ ...decodedTxn }),
        createdAt: new Date(block.timestamp),
        timestampCreation: new Date(block.timestamp),
        timestampLast: new Date(block.timestamp),
        totalByteSize: 0,
        updatedAt: new Date(block.timestamp),
        avgNativePrice: priceFeed.nativePrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalTxnCount: 0,
        totalFeesNative: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.height,
        creationTxnId: decodedTxn.hash,
        lastUpdatedTxnId: "",
      });
    }
    if (appEntity.lastUpdatedTxnId !== blob.transactionId) {
      appEntity.lastUpdatedTxnId = blob.transactionId!;
      appEntity.totalTxnCount += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        appEntity.totalDAFees =
          appEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        appEntity.totalDAFeesUSD = appEntity.totalDAFeesUSD! + feesUSD;
        appEntity.totalDataSubmissionCount =
          appEntity.totalDataSubmissionCount! + 1;

        appEntity.totalByteSize =
          appEntity.totalByteSize + Number(dataSubmissionSize);
      }
      appEntity.totalFeesNative =
        appEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      appEntity.totalFeesUSD = appEntity.totalFeesUSD! + Number(feesUSD);
    }
    appEntity.timestampLast = new Date(block.timestamp);

    appEntity.updatedAt = new Date(block.timestamp);
    appEntity.avgNativePrice =
      (appEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (appEntity.endBlock!.toString() != block.height.toString()) {
      appEntity.totalDataBlocksCount = appEntity.totalDataBlocksCount! + 1;
    }

    if (appEntity.endBlock!.toString() != block.height.toString()) {
      appEntity.totalBlocksCount = appEntity.totalBlocksCount! + 1;
    }

    appEntity.lastPriceFeedId = priceFeed.id;
    appEntity.endBlock = block.height;
    // logger.info(`APP SAVE::::::  ${JSON.stringify(appEntity.id)}`);

    // return appEntity;
    // await appEntity.save();
    return appEntity;
  } catch (error) {
    logger.error(` APP SAVE ERROR::::::  ${error}`);
    throw error;
  }
}

export async function handleAppDayData(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },

  type: number = 0,
  appData: AppEntity,
  blob: BlobData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour

  const prevDayId = dayId - 1;
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = `${appData.id}-dayId-${dayId}`;
    const previd = `${appData.id}-dayId-${prevDayId}`;

    let appDayEntity = await AppDayData.get(id);

    if (appDayEntity === undefined || appDayEntity === null) {
      appDayEntity = AppDayData.create({
        id: id,
        appId: appData.id,
        timestampStart: new Date(block.timestamp),
        attachedAppId: appData.id,
        prevDayDataId: previd,
        totalDataAccountsCount: 0,
        totalFees: 0,
        type: 0,
        timestampLast: new Date(block.timestamp),
        totalByteSize: 0,
        avgNativePrice: priceFeed.nativePrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalTxnCount: 0,
        totalFeesNative: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.height,

        lastUpdatedTxnId: "",
        collectiveDayDataId: dayId?.toString(),
      });
    }
    if (appDayEntity.lastUpdatedTxnId !== blob.transactionId) {
      appDayEntity.lastUpdatedTxnId = blob.transactionId!;
      appDayEntity.totalTxnCount! += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        appDayEntity.totalDAFees =
          appDayEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        appDayEntity.totalDAFeesUSD = appDayEntity.totalDAFeesUSD! + feesUSD;
        appDayEntity.totalDataSubmissionCount =
          appDayEntity.totalDataSubmissionCount! + 1;

        appDayEntity.totalByteSize =
          appDayEntity.totalByteSize + Number(dataSubmissionSize);
      }
      appDayEntity.totalFeesNative =
        appDayEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      appDayEntity.totalFeesUSD = appDayEntity.totalFeesUSD! + Number(feesUSD);
    }
    appDayEntity.timestampLast = new Date(block.timestamp);

    appDayEntity.avgNativePrice =
      (appDayEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (appDayEntity.endBlock!.toString() != block.height.toString()) {
      appDayEntity.totalDataBlocksCount =
        appDayEntity.totalDataBlocksCount! + 1;
    }

    if (appDayEntity.endBlock!.toString() != block.height.toString()) {
      appDayEntity.totalBlocksCount = appDayEntity.totalBlocksCount! + 1;
    }

    appDayEntity.lastPriceFeedId = priceFeed.id;
    appDayEntity.endBlock = block.height;
    appDayEntity.collectiveHourDataId = hourId?.toString();

    // logger.info(`APP DAY SAVE::::::  ${JSON.stringify(appDayEntity.id)}`);

    // return appEntity;
    // await appDayEntity.save();
    return appDayEntity;
  } catch (error) {
    logger.error(` APP DAY SAVE ERROR::::::  ${error}`);
    throw error;
  }
}
export async function handleAppHourData(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },

  type: number = 0,
  appData: AppEntity,
  blob: BlobData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = `${appData.id}-hourId-${hourId}`;
    const previd = `${appData.id}-hourId-${prevHourId}`;

    let appHourEntity = await AppHourData.get(id);

    if (appHourEntity === undefined || appHourEntity === null) {
      appHourEntity = AppHourData.create({
        id: id,
        appId: appData.id,
        timestampStart: new Date(block.timestamp),
        attachedAppId: appData.id,
        prevHourDataId: previd,
        totalDataAccountsCount: 0,
        totalFees: 0,
        type: 0,
        timestampLast: new Date(block.timestamp),
        totalByteSize: 0,
        avgNativePrice: priceFeed.nativePrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalTxnCount: 0,
        totalFeesNative: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.height,

        lastUpdatedTxnId: "",
        collectiveDayDataId: dayId?.toString(),
        collectiveHourDataId: hourId?.toString(),
      });
    }
    if (appHourEntity.lastUpdatedTxnId !== blob.transactionId) {
      appHourEntity.lastUpdatedTxnId = blob.transactionId!;
      appHourEntity.totalTxnCount! += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        appHourEntity.totalDAFees =
          appHourEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        appHourEntity.totalDAFeesUSD = appHourEntity.totalDAFeesUSD! + feesUSD;
        appHourEntity.totalDataSubmissionCount =
          appHourEntity.totalDataSubmissionCount! + 1;

        appHourEntity.totalByteSize =
          appHourEntity.totalByteSize + Number(dataSubmissionSize);
      }
      appHourEntity.totalFeesNative =
        appHourEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      appHourEntity.totalFeesUSD =
        appHourEntity.totalFeesUSD! + Number(feesUSD);
    }
    appHourEntity.timestampLast = new Date(block.timestamp);

    appHourEntity.avgNativePrice =
      (appHourEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (appHourEntity.endBlock!.toString() != block.height.toString()) {
      appHourEntity.totalDataBlocksCount =
        appHourEntity.totalDataBlocksCount! + 1;
    }

    if (appHourEntity.endBlock!.toString() != block.height.toString()) {
      appHourEntity.totalBlocksCount = appHourEntity.totalBlocksCount! + 1;
    }

    appHourEntity.lastPriceFeedId = priceFeed.id;
    appHourEntity.endBlock = block.height;

    // logger.info(`APP HOUR SAVE::::::  ${JSON.stringify(appHourEntity.id)}`);

    // return appEntity;
    // await appHourEntity.save();
    return appHourEntity;
  } catch (error) {
    logger.error(` APP HOUR SAVE ERROR::::::  ${error}`);
    throw error;
  }
}
