"use strict";

import {
  CollectiveData,
  CollectiveDayData,
  CollectiveHourData,
  PriceFeedMinute,
} from "../../types";

import { CosmosBlock } from "@subql/types-cosmos";
import { TxStats } from "../../utils/decodeBlockTx";

export async function handleCollective(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  type: number = 0
) {
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = "1";
    const txnId = decodedTxn.hash;
    let collectiveEntity = await CollectiveData.get(id);

    if (collectiveEntity === undefined || collectiveEntity === null) {
      collectiveEntity = CollectiveData.create({
        id: id,
        timestampLast: new Date(block.timestamp),
        totalByteSize: 0,
        avgNativePrice: priceFeed.nativePrice,
        totalDAFees: 0,
        totalFees: 0,
        totalDataAccountsCount: 0,
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
        lastUpdatedTxnId: "",
      });
    }
    if (collectiveEntity.lastUpdatedTxnId !== txnId) {
      collectiveEntity.lastUpdatedTxnId = txnId!;
      collectiveEntity.totalTxnCount! += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        collectiveEntity.totalDAFees =
          collectiveEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        collectiveEntity.totalDAFeesUSD =
          collectiveEntity.totalDAFeesUSD! + feesUSD;
        collectiveEntity.totalDataSubmissionCount =
          collectiveEntity.totalDataSubmissionCount! + 1;
        collectiveEntity.totalByteSize =
          collectiveEntity.totalByteSize + Number(dataSubmissionSize);
      }

      collectiveEntity.totalFeesNative =
        collectiveEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      collectiveEntity.totalFeesUSD =
        collectiveEntity.totalFeesUSD! + Number(feesUSD);
    }
    collectiveEntity.timestampLast = new Date(block.timestamp);

    collectiveEntity.avgNativePrice =
      (collectiveEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (collectiveEntity.endBlock!.toString() != block.height.toString()) {
      collectiveEntity.totalDataBlocksCount =
        collectiveEntity.totalDataBlocksCount! + 1;
    }

    if (collectiveEntity.endBlock!.toString() != block.height.toString()) {
      collectiveEntity.totalBlocksCount =
        collectiveEntity.totalBlocksCount! + 1;
    }

    collectiveEntity.lastPriceFeedId = priceFeed.id;
    collectiveEntity.endBlock = block.height;
    // logger.info(
    //   `COLLECTIVE SAVE::::::  ${JSON.stringify(collectiveEntity.id)}`
    // );

    return collectiveEntity;
    // await collectiveEntity.save();
  } catch (error) {
    logger.error(` COLLECTIVE SAVE ERROR::::::  ${error}`);
    throw error;
  }
}

export async function handleCollectiveDayData(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  type: number = 0,
  collectiveEntity: CollectiveData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = `${dayId}`;
    const previd = `${prevDayId}`;
    const txnId = decodedTxn.hash;

    let collectiveDayEntity = await CollectiveDayData.get(id);

    if (collectiveDayEntity === undefined || collectiveDayEntity === null) {
      collectiveDayEntity = CollectiveDayData.create({
        id: id,
        collectiveDataId: collectiveEntity.id,
        timestampStart: new Date(block.timestamp),

        prevDayDataId: previd,
        totalDataAccountsCount: 0,
        totalFees: 0,

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
      });
    }
    if (collectiveDayEntity.lastUpdatedTxnId !== txnId) {
      collectiveDayEntity.lastUpdatedTxnId = txnId!;
      collectiveDayEntity.totalTxnCount! += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        collectiveDayEntity.totalDAFees =
          collectiveDayEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        collectiveDayEntity.totalDAFeesUSD =
          collectiveDayEntity.totalDAFeesUSD! + feesUSD;
        collectiveDayEntity.totalDataSubmissionCount =
          collectiveDayEntity.totalDataSubmissionCount! + 1;

        collectiveDayEntity.totalByteSize =
          collectiveDayEntity.totalByteSize + Number(dataSubmissionSize);
      }
      collectiveDayEntity.totalFeesNative =
        collectiveDayEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      collectiveDayEntity.totalFeesUSD =
        collectiveDayEntity.totalFeesUSD! + Number(feesUSD);
    }
    collectiveDayEntity.timestampLast = new Date(block.timestamp);

    collectiveDayEntity.avgNativePrice =
      (collectiveDayEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (collectiveDayEntity.endBlock!.toString() != block.height.toString()) {
      collectiveDayEntity.totalDataBlocksCount =
        collectiveDayEntity.totalDataBlocksCount! + 1;
    }

    if (collectiveDayEntity.endBlock!.toString() != block.height.toString()) {
      collectiveDayEntity.totalBlocksCount =
        collectiveDayEntity.totalBlocksCount! + 1;
    }

    collectiveDayEntity.lastPriceFeedId = priceFeed.id;
    collectiveDayEntity.endBlock = block.height;
    // logger.info(
    //   `COLLECTIVE DAY SAVE::::::  ${JSON.stringify(collectiveDayEntity.id)}`
    // );

    return collectiveDayEntity;
    // await collectiveDayEntity.save();
  } catch (error) {
    logger.error(` COLLECTIVE DAY SAVE ERROR::::::  ${error}`);
    throw error;
  }
}
export async function handleCollectiveHourData(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  type: number = 0,
  collectiveEntity: CollectiveData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

    const id = `${hourId}`;
    const previd = `${prevHourId}`;
    const txnId = decodedTxn.hash;

    let collectiveHourEntity = await CollectiveHourData.get(id);

    if (collectiveHourEntity === undefined || collectiveHourEntity === null) {
      collectiveHourEntity = CollectiveHourData.create({
        id: id,
        collectiveDataId: collectiveEntity.id,
        timestampStart: new Date(block.timestamp),

        prevHourDataId: previd,
        totalDataAccountsCount: 0,
        totalFees: 0,

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
      });
    }
    if (collectiveHourEntity.lastUpdatedTxnId !== txnId) {
      collectiveHourEntity.lastUpdatedTxnId = txnId!;
      collectiveHourEntity.totalTxnCount! += 1;

      const fees = Number(decodedTxn.txFee);
      const feesUSD = fees * priceFeed.nativePrice;
      if (decodedTxn?.blobs?.length > 0) {
        collectiveHourEntity.totalDAFees =
          collectiveHourEntity.totalDAFees! + Number(decodedTxn.txFee)!;
        collectiveHourEntity.totalDAFeesUSD =
          collectiveHourEntity.totalDAFeesUSD! + feesUSD;
        collectiveHourEntity.totalDataSubmissionCount =
          collectiveHourEntity.totalDataSubmissionCount! + 1;

        collectiveHourEntity.totalByteSize =
          collectiveHourEntity.totalByteSize + Number(dataSubmissionSize);
      }
      collectiveHourEntity.totalFeesNative =
        collectiveHourEntity.totalFeesNative! + Number(decodedTxn.txFee!);

      collectiveHourEntity.totalFeesUSD =
        collectiveHourEntity.totalFeesUSD! + Number(feesUSD);
    }
    collectiveHourEntity.timestampLast = new Date(block.timestamp);

    collectiveHourEntity.avgNativePrice =
      (collectiveHourEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    if (collectiveHourEntity.endBlock!.toString() != block.height.toString()) {
      collectiveHourEntity.totalDataBlocksCount =
        collectiveHourEntity.totalDataBlocksCount! + 1;
    }

    if (collectiveHourEntity.endBlock!.toString() != block.height.toString()) {
      collectiveHourEntity.totalBlocksCount =
        collectiveHourEntity.totalBlocksCount! + 1;
    }

    collectiveHourEntity.lastPriceFeedId = priceFeed.id;
    collectiveHourEntity.endBlock = block.height;
    // logger.info(
    //   `COLLECTIVE HOUR SAVE::::::  ${JSON.stringify(collectiveHourEntity.id)}`
    // );

    return collectiveHourEntity;
    // await collectiveHourEntity.save();
  } catch (error) {
    logger.error(` COLLECTIVE HOUR SAVE ERROR::::::  ${error}`);
    throw error;
  }
}
