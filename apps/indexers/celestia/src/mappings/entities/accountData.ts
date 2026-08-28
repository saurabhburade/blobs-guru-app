"use strict";

import {
  AccountDayData,
  AccountEntity,
  AccountHourData,
  AppEntity,
  PriceFeedMinute,
} from "../../types";

import { CosmosBlock } from "@subql/types-cosmos";
import { TxStats } from "../../utils/decodeBlockTx";

export async function handleAccount(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },
  type: number = 0,
  appRecord?: AppEntity
) {
  try {
    let dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;
    const id =
      type === 1
        ? `${decodedTxn.signer.toString()}-${appRecord!.id}`
        : `${decodedTxn.signer.toString()}`;
    let accountEntity = await AccountEntity.get(id);

    if (accountEntity === undefined || accountEntity === null) {
      accountEntity = AccountEntity.create({
        id: id,
        address: decodedTxn.signer,
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
        totalFees: 0,
        totalFeesNative: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.height,
        type,
      });
    }

    accountEntity.timestampLast = new Date(block.timestamp);

    accountEntity.updatedAt = new Date(block.timestamp);
    accountEntity.avgNativePrice =
      (accountEntity.avgNativePrice! + priceFeed.nativePrice) / 2;

    // const extrinsicType = `${decodedTxn.}_${methodData.method}`;
    const isDataSubmission = decodedTxn.blobs.length > 0;
    const fees = Number(decodedTxn.txFee);
    const feesUSD = fees * priceFeed.nativePrice;
    if (isDataSubmission) {
      accountEntity.totalDAFees =
        accountEntity.totalDAFees! + Number(decodedTxn.txFee)!;
      accountEntity.totalDAFeesUSD = accountEntity.totalDAFeesUSD! + feesUSD;
      accountEntity.totalDataSubmissionCount =
        accountEntity.totalDataSubmissionCount! + 1;

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
    accountEntity.totalFees =
      accountEntity.totalFees! + Number(decodedTxn.txFee!);
    accountEntity.totalFeesNative =
      accountEntity.totalFeesNative! + Number(decodedTxn.txFee!);
    accountEntity.totalFeesUSD = accountEntity.totalFeesUSD! + Number(feesUSD);
    accountEntity.lastPriceFeedId = priceFeed.id;
    accountEntity.endBlock = block.height;
    // logger.info(`New ACCOUNT SAVE::::::  ${JSON.stringify(accountEntity.id)}`);
    if (type === 1) {
      accountEntity.appId = appRecord!.id;
      accountEntity.attachedAppId = appRecord!.id;
      // await accountEntity.save();
    }
    // return accountEntity;
    // await accountEntity.save();
    return accountEntity;
  } catch (error) {
    logger.error(`New ACCOUNT SAVE ERROR::::::  ${error}`);
    throw error;
  }
}

export async function handleAccountDayData(
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },

  type: number = 0,
  appRecord?: AppEntity
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;

  const id =
    type === 1
      ? `${decodedTxn.signer.toString()}-dayId-${dayId}-${appRecord!.id}`
      : `${decodedTxn.signer.toString()}-dayId-${dayId}`;
  const idPrev =
    type === 1
      ? `${decodedTxn.signer.toString()}-dayId-${prevDayId}-${appRecord!.id}`
      : `${decodedTxn.signer.toString()}-dayId-${prevDayId}`;

  const dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

  let accountDayDataRecord = await AccountDayData.get(id);

  if (accountDayDataRecord === undefined || accountDayDataRecord === null) {
    accountDayDataRecord = AccountDayData.create({
      id: id,
      accountId: decodedTxn.signer.toString(),
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
      type,
      collectiveDayDataId: dayId?.toString(),
    });
  }
  if (type === 1) {
    accountDayDataRecord.appId = appRecord!.id;
    accountDayDataRecord.attachedAppId = appRecord!.id;
  }

  accountDayDataRecord.timestampLast = new Date(block.timestamp);

  accountDayDataRecord.avgNativePrice =
    (accountDayDataRecord.avgNativePrice! + priceFeed.nativePrice) / 2;

  const fees = Number(decodedTxn.txFee);
  const feesUSD = fees * priceFeed.nativePrice;
  if (decodedTxn?.blobs?.length > 0) {
    accountDayDataRecord.totalDAFees =
      accountDayDataRecord.totalDAFees! + Number(fees)!;
    accountDayDataRecord.totalDAFeesUSD =
      accountDayDataRecord.totalDAFeesUSD! + feesUSD;
    accountDayDataRecord.totalDataSubmissionCount =
      accountDayDataRecord.totalDataSubmissionCount! + 1;
    accountDayDataRecord.totalByteSize =
      accountDayDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      accountDayDataRecord.endBlock!.toString() != block.height.toString()
    ) {
      accountDayDataRecord.totalDataBlocksCount =
        accountDayDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    accountDayDataRecord.endBlock!.toString() != block.height.toString()
  ) {
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
  decodedTxn: TxStats,
  priceFeed: PriceFeedMinute,
  block: { height: number; timestamp: number },

  type: number = 0,
  appRecord?: AppEntity
) {
  const blockDate = new Date(Number(block.timestamp));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  const id =
    type === 1
      ? `${decodedTxn.signer.toString()}-hourId-${hourId}-${appRecord!.id}`
      : `${decodedTxn.signer.toString()}-hourId-${hourId}`;
  const idPrev =
    type === 1
      ? `${decodedTxn.signer.toString()}-hourId-${prevHourId}-${appRecord!.id}`
      : `${decodedTxn.signer.toString()}-hourId-${prevHourId}`;

  const dataSubmissionSize = decodedTxn.totalBytes ? decodedTxn?.totalBytes : 0;

  let accountHourDataRecord = await AccountHourData.get(id);

  if (accountHourDataRecord === undefined || accountHourDataRecord === null) {
    accountHourDataRecord = AccountHourData.create({
      id: id,
      accountId: decodedTxn.signer.toString(),
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
      type,
      collectiveHourDataId: hourId.toString(),
    });
  }
  if (type === 1) {
    accountHourDataRecord.appId = appRecord!.id;
    accountHourDataRecord.attachedAppId = appRecord!.id;
  }

  accountHourDataRecord.timestampLast = new Date(block.timestamp);

  accountHourDataRecord.avgNativePrice =
    (accountHourDataRecord.avgNativePrice! + priceFeed.nativePrice) / 2;

  const fees = Number(decodedTxn.txFee);
  const feesUSD = fees * priceFeed.nativePrice;
  if (decodedTxn?.blobs?.length > 0) {
    accountHourDataRecord.totalDAFees =
      accountHourDataRecord.totalDAFees! + Number(fees)!;
    accountHourDataRecord.totalDAFeesUSD =
      accountHourDataRecord.totalDAFeesUSD! + feesUSD;
    accountHourDataRecord.totalDataSubmissionCount =
      accountHourDataRecord.totalDataSubmissionCount! + 1;
    accountHourDataRecord.totalByteSize =
      accountHourDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      accountHourDataRecord.endBlock!.toString() !=
      block.height.toString()
    ) {
      accountHourDataRecord.totalDataBlocksCount =
        accountHourDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    accountHourDataRecord.endBlock!.toString() != block.height.toString()
  ) {
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
