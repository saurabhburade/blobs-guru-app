"use strict";

import {
  CollectiveData,
  CollectiveDayData,
  CollectiveHourData,
  PriceFeedMinute,
} from "../../types";

import { EthereumTransaction } from "@subql/types-ethereum";
import { BYTES_PER_BLOB } from "../../utils";

export async function handleCollective(
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number }
) {
  try {
    const dataSubmissionSize =
      (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;

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

      const fees = Number(decodedTxn.gas) * Number(decodedTxn.gasPrice);
      const feesUSD = fees * priceFeed.nativePrice;
      if (
        decodedTxn?.blobVersionedHashes &&
        decodedTxn?.blobVersionedHashes?.length > 0
      ) {
        const feesDA =
          Number(decodedTxn.maxFeePerBlobGas) *
          Number(decodedTxn.blobVersionedHashes?.length) *
          BYTES_PER_BLOB;
        const feesUSDDA = feesDA * priceFeed.nativePrice;

        collectiveEntity.totalDAFees = collectiveEntity.totalDAFees! + feesDA;
        collectiveEntity.totalDAFeesUSD =
          collectiveEntity.totalDAFeesUSD! + feesUSDDA;
        collectiveEntity.totalDataSubmissionCount =
          collectiveEntity.totalDataSubmissionCount! +
          decodedTxn?.blobVersionedHashes?.length;
        collectiveEntity.totalByteSize =
          collectiveEntity.totalByteSize + Number(dataSubmissionSize);
      }

      collectiveEntity.totalFeesNative =
        collectiveEntity.totalFeesNative! + fees;

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
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  collectiveEntity: CollectiveData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  try {
    const dataSubmissionSize =
      (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;

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
      const fees = Number(decodedTxn.gas) * Number(decodedTxn.gasPrice);
      const feesUSD = fees * priceFeed.nativePrice;
      if (
        decodedTxn?.blobVersionedHashes &&
        decodedTxn?.blobVersionedHashes?.length > 0
      ) {
        const feesDA =
          Number(decodedTxn.maxFeePerBlobGas) *
          Number(decodedTxn.blobVersionedHashes?.length) *
          BYTES_PER_BLOB;
        const feesUSDDA = feesDA * priceFeed.nativePrice;

        collectiveDayEntity.totalDAFees =
          collectiveDayEntity.totalDAFees! + feesDA!;
        collectiveDayEntity.totalDAFeesUSD =
          collectiveDayEntity.totalDAFeesUSD! + feesUSDDA;
        collectiveDayEntity.totalDataSubmissionCount =
          collectiveDayEntity.totalDataSubmissionCount! +
          Number(decodedTxn.blobVersionedHashes?.length);

        collectiveDayEntity.totalByteSize =
          collectiveDayEntity.totalByteSize + Number(dataSubmissionSize);
      }
      collectiveDayEntity.totalFeesNative =
        collectiveDayEntity.totalFeesNative! + fees;

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
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  collectiveEntity: CollectiveData
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  try {
    const dataSubmissionSize =
      (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;

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

      const fees = Number(decodedTxn.gas) * Number(decodedTxn.gasPrice);
      const feesUSD = fees * priceFeed.nativePrice;
      if (
        decodedTxn?.blobVersionedHashes &&
        decodedTxn?.blobVersionedHashes?.length > 0
      ) {
        const feesDA =
          Number(decodedTxn.maxFeePerBlobGas) *
          Number(decodedTxn.blobVersionedHashes?.length) *
          BYTES_PER_BLOB;
        const feesUSDDA = feesDA * priceFeed.nativePrice;
        collectiveHourEntity.totalDAFees =
          collectiveHourEntity.totalDAFees! + feesDA;
        collectiveHourEntity.totalDAFeesUSD =
          collectiveHourEntity.totalDAFeesUSD! + feesUSDDA;
        collectiveHourEntity.totalDataSubmissionCount =
          collectiveHourEntity.totalDataSubmissionCount! +
          Number(decodedTxn?.blobVersionedHashes?.length);

        collectiveHourEntity.totalByteSize =
          collectiveHourEntity.totalByteSize + Number(dataSubmissionSize);
      }
      collectiveHourEntity.totalFeesNative =
        collectiveHourEntity.totalFeesNative! + fees;

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
