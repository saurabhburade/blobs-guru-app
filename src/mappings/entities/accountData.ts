"use strict";

import { SubstrateExtrinsic } from "@subql/types";
import {
  AccountEntity,
  AppEntity,
  Extrinsic,
  PriceFeedMinute,
} from "../../types";
import { CorrectSubstrateBlock } from "../mappingHandlers";
import { handleAccountDayData } from "../intervals/day/handleDayData";
import { handleAccountHourData } from "../intervals/hour/handleHourData";
import { roundPrice } from "../../utils";

export async function handleAccount(
  extrinsicRecord: Extrinsic,
  extrinsic: Omit<SubstrateExtrinsic, "events" | "success">,
  priceFeed: PriceFeedMinute,
  type: number = 0,
  appRecord?: AppEntity
) {
  try {
    const block = extrinsic.block as CorrectSubstrateBlock;
    const ext = extrinsic.extrinsic;
    const methodData = ext.method;
    let dataSubmissionSize =
      methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
    const id =
      type === 1
        ? `${extrinsicRecord.signer.toString()}-${appRecord!.id}`
        : `${extrinsicRecord.signer.toString()}`;
    let accountEntity = await AccountEntity.get(id);

    const oneMbInBytes = 1_048_576;
    const feesPerMb =
      (extrinsicRecord.feesRounded! / dataSubmissionSize) * oneMbInBytes;
    if (accountEntity === undefined || accountEntity === null) {
      accountEntity = AccountEntity.create({
        id: id,
        address: extrinsicRecord.signer.toString(),
        createdAt: extrinsicRecord.timestamp,
        timestampCreation: extrinsicRecord.timestamp,
        timestampLast: extrinsicRecord.timestamp,
        totalByteSize: 0,
        updatedAt: extrinsicRecord.timestamp,
        amount: "0",
        amountFrozen: "0",
        amountFrozenRounded: 0,
        amountRounded: 0,
        amountTotal: "0",
        amountTotalRounded: 0,
        balanceReserved: 0,
        balanceFree: 0,
        avgAvailPrice: extrinsicRecord.availPrice,
        avgEthPrice: extrinsicRecord.ethPrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalExtrinsicCount: 0,
        totalFees: 0,
        totalFeesAvail: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.block.header.number.toNumber(),
        type,
      });
    }
    //  {"nonce":3014,"consumers":0,"providers":1,"sufficients":0,"data":{"free":"0x0000000000001f3f5392a7503702c202","reserved":0,"frozen":0,"flags":"0x80000000000000000000000000000000"}}
    // @ts-ignore
    // const { data: balance } = (await // @ts-ignore
    // (api as any).query.system.account(
    //   extrinsicRecord.signer.toString()
    // )) as any;

    // let balanceFrozen: bigint | undefined = undefined;
    // if (frozen) {
    //   balanceFrozen = frozen.toBigInt();
    // } else {
    //   if (miscFrozen && feeFrozen) {
    //     const balanceFrozenMisc = miscFrozen.toBigInt();
    //     const balanceFrozenFee = feeFrozen.toBigInt();
    //     balanceFrozen =
    //       balanceFrozenFee > balanceFrozenMisc
    //         ? balanceFrozenFee
    //         : balanceFrozenMisc;
    //   } else if (miscFrozen) {
    //     balanceFrozen = miscFrozen.toBigInt();
    //   } else if (feeFrozen) {
    //     balanceFrozen = feeFrozen.toBigInt();
    //   }
    // }
    // const balanceReserved = reserved.toBigInt();
    // const balanceFree = free.toBigInt();
    // const amountFrozen = balanceFrozen ? balanceFrozen.toString() : "0";
    // const amountTotal = (balanceFree + balanceReserved).toString();
    // const amount = balanceFrozen
    //   ? (balanceFree - balanceFrozen).toString()
    //   : balanceFree.toString();
    // accountEntity.amount = amount;
    // accountEntity.amountFrozen = amountFrozen;
    // accountEntity.amountTotal = amountTotal;
    // accountEntity.amountRounded = roundPrice(accountEntity.amount!);
    // accountEntity.amountFrozenRounded = roundPrice(accountEntity.amountFrozen);
    // accountEntity.amountTotalRounded = roundPrice(accountEntity.amountTotal!);
    // accountEntity.balanceFree = Number(balanceFree);
    // accountEntity.balanceReserved = Number(balanceReserved);

    accountEntity.timestampLast = extrinsicRecord.timestamp;

    accountEntity.updatedAt = extrinsicRecord.timestamp;
    accountEntity.avgAvailPrice =
      (accountEntity.avgAvailPrice! + priceFeed.availPrice) / 2;
    accountEntity.avgEthPrice =
      (accountEntity.avgEthPrice! + priceFeed.ethPrice) / 2;
    const extrinsicType = `${methodData.section}_${methodData.method}`;
    const isDataSubmission = extrinsicType === "dataAvailability_submitData";
    const fees = Number(extrinsicRecord.fees);
    const feesUSD = fees * priceFeed.availPrice;
    if (isDataSubmission) {
      accountEntity.totalDAFees =
        accountEntity.totalDAFees! + Number(extrinsicRecord.fees)!;
      accountEntity.totalDAFeesUSD = accountEntity.totalDAFeesUSD! + feesUSD;
      accountEntity.totalDataSubmissionCount =
        accountEntity.totalDataSubmissionCount! + 1;

      accountEntity.totalByteSize =
        accountEntity.totalByteSize + Number(dataSubmissionSize);
      if (
        accountEntity.endBlock!.toString() !=
        block.block.header.number.toNumber().toString()
      ) {
        accountEntity.totalDataBlocksCount =
          accountEntity.totalDataBlocksCount! + 1;
      }
    }
    if (
      accountEntity.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      accountEntity.totalBlocksCount = accountEntity.totalBlocksCount! + 1;
    }
    accountEntity.totalExtrinsicCount = accountEntity.totalExtrinsicCount! + 1;
    accountEntity.totalFees =
      accountEntity.totalFees! + Number(extrinsicRecord.fees!);
    accountEntity.totalFeesAvail =
      accountEntity.totalFeesAvail! + Number(extrinsicRecord.fees!);
    accountEntity.totalFeesUSD = accountEntity.totalFeesUSD! + Number(feesUSD);
    accountEntity.lastPriceFeedId = priceFeed.id;
    accountEntity.endBlock = block.block.header.number.toNumber();
    // logger.info(`New ACCOUNT SAVE::::::  ${JSON.stringify(accountEntity)}`);
    if (type === 1) {
      accountEntity.appId = appRecord!.id;
      accountEntity.attachedAppId = appRecord!.id;
    }
    await accountEntity.save();
  } catch (error) {
    logger.error(`New ACCOUNT SAVE ERROR::::::  ${error}`);
    throw error;
  }
}
