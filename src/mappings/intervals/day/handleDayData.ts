import { SubstrateExtrinsic } from "@subql/types";
import {
  AccountDayData,
  AppDayData,
  AppEntity,
  CollectiveDayData,
  DataSubmission,
  Extrinsic,
  PriceFeedMinute,
} from "../../../types";
import { CorrectSubstrateBlock } from "../../mappingHandlers";
import { roundPrice } from "../../../utils";

export async function handleDayData(
  block: CorrectSubstrateBlock,
  priceFeed: PriceFeedMinute,
  { totalFee }: { totalFee: number },
  {
    daSubmissionsLength,
    daFees,
    daSize,
  }: { daSubmissionsLength: number; daFees: number; daSize: number }
) {
  const blockDate = new Date(Number(block.timestamp.getTime()));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;

  let dayDataRecord = await CollectiveDayData.get(dayId.toString());
  if (dayDataRecord === undefined || dayDataRecord === null) {
    dayDataRecord = CollectiveDayData.create({
      id: dayId.toString(),
      timestampLast: block.timestamp,
      totalByteSize: 0,
      avgAvailPrice: priceFeed.availPrice,
      avgEthPrice: priceFeed.ethPrice,
      lastPriceFeedId: priceFeed.id,
      totalBlocksCount: 0,
      totalDataAccountsCount: 0,
      totalDataSubmissionCount: 0,
      totalDataBlocksCount: 0,
      totalExtrinsicCount: 0,
      totalFees: 0,
      totalFeesAvail: 0,
      totalFeesUSD: 0,
      totalTransferCount: 0,
      totalDAFees: 0,
      totalDAFeesUSD: 0,
      timestampStart: block.timestamp,
      startBlock: block.block.header.number.toNumber(),
      endBlock: block.block.header.number.toNumber(),
      //   prevDayDataId: prevDayId.toString(),
    });
  }

  dayDataRecord.avgAvailPrice =
    (dayDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  dayDataRecord.avgEthPrice =
    (dayDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  dayDataRecord.endBlock = block.block.header.number.toNumber();
  dayDataRecord.timestampLast = block.timestamp;

  const totalFeeUSD = totalFee * priceFeed.availPrice;
  dayDataRecord.totalFees = dayDataRecord.totalFees! + totalFee;
  dayDataRecord.totalFeesAvail = dayDataRecord.totalFeesAvail! + totalFee;
  dayDataRecord.totalFeesUSD = dayDataRecord.totalFeesUSD! + totalFeeUSD;
  if (daSubmissionsLength > 0) {
    // const daFees = daSubmissions.reduce((sum, das) => {
    //   if (das.fees) {
    //     sum = sum + das.fees || 0;
    //   }
    //   return sum;
    // }, 0);
    // const daSize = daSubmissions.reduce((sum, das) => {
    //   if (das.byteSize) {
    //     sum = sum + das.byteSize || 0;
    //   }
    //   return sum;
    // }, 0);
    const daFeesUSD = daFees * priceFeed.availPrice;
    dayDataRecord.totalDataBlocksCount =
      dayDataRecord.totalDataBlocksCount! + 1;
    dayDataRecord.totalDAFees = dayDataRecord.totalDAFees! + daFees;
    dayDataRecord.totalDAFeesUSD = dayDataRecord.totalDAFeesUSD! + daFeesUSD;
    dayDataRecord.totalDataSubmissionCount =
      dayDataRecord.totalDataSubmissionCount! + daSubmissionsLength;
    dayDataRecord.totalByteSize = dayDataRecord.totalByteSize! + daSize || 0;
  }
  dayDataRecord.totalBlocksCount = dayDataRecord.totalBlocksCount! + 1;
  dayDataRecord.totalExtrinsicCount = dayDataRecord.totalExtrinsicCount! + 1;
  await dayDataRecord.save();
}
export async function handleAccountDayData(
  extrinsicRecord: Extrinsic,
  extrinsic: Omit<SubstrateExtrinsic, "events" | "success">,
  priceFeed: PriceFeedMinute,
  type: number = 0,
  appRecord?: AppEntity
): Promise<AccountDayData> {
  const block = extrinsic.block as CorrectSubstrateBlock;

  const blockDate = new Date(Number(block.timestamp.getTime()));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const ext = extrinsic.extrinsic;
  const id =
    type === 1
      ? `${extrinsicRecord.signer.toString()}-dayId-${dayId}-${appRecord!.id}`
      : `${extrinsicRecord.signer.toString()}-dayId-${dayId}`;
  const idPrev =
    type === 1
      ? `${extrinsicRecord.signer.toString()}-dayId-${prevDayId}-${
          appRecord!.id
        }`
      : `${extrinsicRecord.signer.toString()}-dayId-${prevDayId}`;
  const methodData = ext.method;
  let dataSubmissionSize =
    methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
  let accountDayDataRecord = await AccountDayData.get(id);
  const oneMbInBytes = 1_048_576;
  const feesPerMb =
    (extrinsicRecord.feesRounded! / dataSubmissionSize) * oneMbInBytes;
  if (accountDayDataRecord === undefined || accountDayDataRecord === null) {
    accountDayDataRecord = AccountDayData.create({
      id: id,
      accountId: extrinsicRecord.signer.toString(),
      timestampLast: extrinsicRecord.timestamp,
      totalByteSize: 0,
      timestampStart: extrinsicRecord.timestamp,
      prevDayDataId: idPrev,
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
  if (type === 1) {
    accountDayDataRecord.appId = appRecord!.id;
    accountDayDataRecord.attachedAppId = appRecord!.id;
  }

  //  {"nonce":3014,"consumers":0,"providers":1,"sufficients":0,"data":{"free":"0x0000000000001f3f5392a7503702c202","reserved":0,"frozen":0,"flags":"0x80000000000000000000000000000000"}}
  // @ts-ignore
  // const { data: balance } = (await // @ts-ignore
  // (api as any).query.system.account(extrinsicRecord.signer.toString())) as any;
  // const { feeFrozen, free, miscFrozen, reserved, frozen } = balance;

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
  // accountDayDataRecord.amount = amount;
  // accountDayDataRecord.amountFrozen = amountFrozen;
  // accountDayDataRecord.amountTotal = amountTotal;
  // accountDayDataRecord.amountRounded = roundPrice(accountDayDataRecord.amount!);
  // accountDayDataRecord.amountFrozenRounded = roundPrice(
  //   accountDayDataRecord.amountFrozen
  // );
  // accountDayDataRecord.amountTotalRounded = roundPrice(
  //   accountDayDataRecord.amountTotal!
  // );

  // accountDayDataRecord.balanceFree = Number(balanceFree);
  // accountDayDataRecord.balanceReserved = Number(balanceReserved);
  accountDayDataRecord.timestampLast = extrinsicRecord.timestamp;

  accountDayDataRecord.avgAvailPrice =
    (accountDayDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  accountDayDataRecord.avgEthPrice =
    (accountDayDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  const extrinsicType = `${methodData.section}_${methodData.method}`;
  const isDataSubmission = extrinsicType === "dataAvailability_submitData";
  const fees = Number(extrinsicRecord.fees);
  const feesUSD = fees * priceFeed.availPrice;
  if (isDataSubmission) {
    accountDayDataRecord.totalDAFees =
      accountDayDataRecord.totalDAFees! + Number(extrinsicRecord.fees)!;
    accountDayDataRecord.totalDAFeesUSD =
      accountDayDataRecord.totalDAFeesUSD! + feesUSD;
    accountDayDataRecord.totalDataSubmissionCount =
      accountDayDataRecord.totalDataSubmissionCount! + 1;
    accountDayDataRecord.totalByteSize =
      accountDayDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      accountDayDataRecord.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      accountDayDataRecord.totalDataBlocksCount =
        accountDayDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    accountDayDataRecord.endBlock!.toString() !=
    block.block.header.number.toNumber().toString()
  ) {
    accountDayDataRecord.totalBlocksCount =
      accountDayDataRecord.totalBlocksCount! + 1;
  }
  accountDayDataRecord.totalExtrinsicCount =
    accountDayDataRecord.totalExtrinsicCount! + 1;
  accountDayDataRecord.totalFees =
    accountDayDataRecord.totalFees! + Number(extrinsicRecord.fees!);
  accountDayDataRecord.totalFeesAvail =
    accountDayDataRecord.totalFeesAvail! + Number(extrinsicRecord.fees!);
  accountDayDataRecord.totalFeesUSD =
    accountDayDataRecord.totalFeesUSD! + Number(feesUSD);
  accountDayDataRecord.lastPriceFeedId = priceFeed.id;
  accountDayDataRecord.endBlock = block.block.header.number.toNumber();
  accountDayDataRecord.collectiveDayDataId = dayId?.toString();
  if (type === 1) {
    await accountDayDataRecord.save();
  }
  return accountDayDataRecord;
  // await accountDayDataRecord.save();
}
