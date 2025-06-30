"use strict";

import {
  AccountDayData,
  AccountEntity,
  AccountHourData,
  PriceFeedMinute,
} from "../../types";

import { EthereumTransaction } from "@subql/types-ethereum";
import { BYTES_PER_BLOB } from "../../utils";

export async function handleAccount(
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number }
) {
  try {
    let dataSubmissionSize =
      (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;
    const id = decodedTxn.from;
    let accountEntity = await AccountEntity.get(id);

    if (accountEntity === undefined || accountEntity === null) {
      accountEntity = AccountEntity.create({
        id: id,
        address: decodedTxn.from,
        createdAt: new Date(block.timestamp),
        totalByteSize: 0,
        updatedAt: new Date(block.timestamp),
        avgNativePrice: priceFeed.nativePrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalTxnCount: 0,
        totalFees: 0,
        totalFeesNative: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.height,
      });
    }

    accountEntity.updatedAt = new Date(block.timestamp);
    accountEntity.avgNativePrice =
      (accountEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    // const extrinsicType = `${decodedTxn.}_${methodData.method}`;
    const isDataSubmission =
      decodedTxn.blobVersionedHashes &&
      decodedTxn.blobVersionedHashes.length > 0;
    const fees = Number(decodedTxn.gas) * Number(decodedTxn.gasPrice);
    const feesUSD = fees * priceFeed.nativePrice;
    if (isDataSubmission) {
      const feesDA =
        Number(decodedTxn.maxFeePerBlobGas) *
        Number(decodedTxn.blobVersionedHashes?.length) *
        BYTES_PER_BLOB;
      const feesUSDDA = feesDA * priceFeed.nativePrice;
      accountEntity.totalDAFees = accountEntity.totalDAFees! + Number(feesDA)!;
      accountEntity.totalDAFeesUSD = accountEntity.totalDAFeesUSD! + feesUSDDA;
      accountEntity.totalDataSubmissionCount =
        accountEntity.totalDataSubmissionCount! +
        Number(decodedTxn.blobVersionedHashes?.length);

      accountEntity.totalByteSize =
        accountEntity.totalByteSize + Number(dataSubmissionSize);
      if (accountEntity.endBlock!.toString() != block.height.toString()) {
        accountEntity.totalDataBlocksCount =
          accountEntity.totalDataBlocksCount! + 1;
      }
    }
    if (accountEntity.endBlock!.toString() != block.height.toString()) {
      accountEntity.totalBlocksCount = accountEntity.totalBlocksCount! + 1;
    }
    accountEntity.totalTxnCount = accountEntity.totalTxnCount! + 1;
    accountEntity.totalFees = accountEntity.totalFees! + Number(fees);
    accountEntity.totalFeesNative =
      accountEntity.totalFeesNative! + Number(fees);
    accountEntity.totalFeesUSD = accountEntity.totalFeesUSD! + Number(feesUSD);
    accountEntity.lastPriceFeedId = priceFeed.id;
    accountEntity.endBlock = block.height;

    // return accountEntity;
    // await accountEntity.save();
    return accountEntity;
  } catch (error) {
    logger.error(`New ACCOUNT SAVE ERROR::::::  ${error}`);
    throw error;
  }
}

export async function handleAccountDayData(
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number }
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;

  const id = `${decodedTxn.from}-dayId-${dayId}`;
  const idPrev = `${decodedTxn.from}-dayId-${prevDayId}`;

  const dataSubmissionSize =
    (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;

  let accountDayDataRecord = await AccountDayData.get(id);

  if (accountDayDataRecord === undefined || accountDayDataRecord === null) {
    accountDayDataRecord = AccountDayData.create({
      id: id,
      accountId: decodedTxn.from,
      timestampLast: new Date(block.timestamp),
      totalByteSize: 0,
      timestampStart: new Date(block.timestamp),
      prevDayDataId: idPrev,
      avgNativePrice: priceFeed.nativePrice,
      totalDAFees: 0,
      totalDAFeesUSD: 0,
      totalDataSubmissionCount: 0,
      totalDataBlocksCount: 0,
      totalBlocksCount: 0,
      totalTxnCount: 0,
      totalFees: 0,
      totalFeesNative: 0,
      totalFeesUSD: 0,
      totalTransferCount: 0,
      lastPriceFeedId: priceFeed.id,
      endBlock: 0,
      startBlock: block.height,

      collectiveDayDataId: dayId?.toString(),
    });
  }

  accountDayDataRecord.timestampLast = new Date(block.timestamp);

  accountDayDataRecord.avgNativePrice =
    (accountDayDataRecord.avgNativePrice! + priceFeed.nativePrice) / 2;

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
    accountDayDataRecord.totalDAFees =
      accountDayDataRecord.totalDAFees! + Number(feesDA)!;
    accountDayDataRecord.totalDAFeesUSD =
      accountDayDataRecord.totalDAFeesUSD! + feesUSDDA;
    accountDayDataRecord.totalDataSubmissionCount =
      accountDayDataRecord.totalDataSubmissionCount! +
      Number(decodedTxn.blobVersionedHashes?.length);
    accountDayDataRecord.totalByteSize =
      accountDayDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (accountDayDataRecord.endBlock!.toString() != block.height.toString()) {
      accountDayDataRecord.totalDataBlocksCount =
        accountDayDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (accountDayDataRecord.endBlock!.toString() != block.height.toString()) {
    accountDayDataRecord.totalBlocksCount =
      accountDayDataRecord.totalBlocksCount! + 1;
  }
  accountDayDataRecord.totalTxnCount = accountDayDataRecord.totalTxnCount! + 1;
  accountDayDataRecord.totalFees =
    accountDayDataRecord.totalFees! + Number(fees!);
  accountDayDataRecord.totalFeesNative =
    accountDayDataRecord.totalFeesNative! + Number(fees!);
  accountDayDataRecord.totalFeesUSD =
    accountDayDataRecord.totalFeesUSD! + Number(feesUSD);
  accountDayDataRecord.lastPriceFeedId = priceFeed.id;
  accountDayDataRecord.endBlock = block.height;

  // if (type === 1) {
  //   await accountDayDataRecord.save();
  // }
  return accountDayDataRecord;
  // await accountDayDataRecord.save();
}
export async function handleAccountHourData(
  decodedTxn: EthereumTransaction,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number }
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  const id = `${decodedTxn.from}-hourId-${hourId}`;
  const idPrev = `${decodedTxn.from}-hourId-${prevHourId}`;

  const dataSubmissionSize =
    (decodedTxn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;

  let accountHourDataRecord = await AccountHourData.get(id);

  if (accountHourDataRecord === undefined || accountHourDataRecord === null) {
    accountHourDataRecord = AccountHourData.create({
      id: id,
      accountId: decodedTxn.from,
      timestampLast: new Date(block.timestamp),
      totalByteSize: 0,
      timestampStart: new Date(block.timestamp),
      prevHourDataId: idPrev,
      avgNativePrice: priceFeed.nativePrice,
      totalDAFees: 0,
      totalDAFeesUSD: 0,
      totalDataSubmissionCount: 0,
      totalDataBlocksCount: 0,
      totalBlocksCount: 0,
      totalTxnCount: 0,
      totalFees: 0,
      totalFeesNative: 0,
      totalFeesUSD: 0,
      totalTransferCount: 0,
      lastPriceFeedId: priceFeed.id,
      endBlock: 0,
      startBlock: block.height,

      collectiveHourDataId: hourId.toString(),
    });
  }

  accountHourDataRecord.timestampLast = new Date(block.timestamp);

  accountHourDataRecord.avgNativePrice =
    (accountHourDataRecord.avgNativePrice! + priceFeed.nativePrice) / 2;

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
    accountHourDataRecord.totalDAFees =
      accountHourDataRecord.totalDAFees! + Number(feesDA)!;
    accountHourDataRecord.totalDAFeesUSD =
      accountHourDataRecord.totalDAFeesUSD! + feesUSDDA;
    accountHourDataRecord.totalDataSubmissionCount =
      accountHourDataRecord.totalDataSubmissionCount! +
      Number(decodedTxn.blobVersionedHashes?.length);
    accountHourDataRecord.totalByteSize =
      accountHourDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (accountHourDataRecord.endBlock!.toString() != block.height.toString()) {
      accountHourDataRecord.totalDataBlocksCount =
        accountHourDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (accountHourDataRecord.endBlock!.toString() != block.height.toString()) {
    accountHourDataRecord.totalBlocksCount =
      accountHourDataRecord.totalBlocksCount! + 1;
  }
  accountHourDataRecord.totalTxnCount =
    accountHourDataRecord.totalTxnCount! + 1;
  accountHourDataRecord.totalFees =
    accountHourDataRecord.totalFees! + Number(fees!);
  accountHourDataRecord.totalFeesNative =
    accountHourDataRecord.totalFeesNative! + Number(fees!);
  accountHourDataRecord.totalFeesUSD =
    accountHourDataRecord.totalFeesUSD! + Number(feesUSD);
  accountHourDataRecord.lastPriceFeedId = priceFeed.id;
  accountHourDataRecord.endBlock = block.height;

  // if (type === 1) {
  //   await accountDayDataRecord.save();
  // }
  return accountHourDataRecord;
  // await accountHourDataRecord.save();
}
