import { SubstrateExtrinsic } from "@subql/types";
import {
  AccountHourData,
  AppEntity,
  CollectiveDayData,
  CollectiveHourData,
  DataSubmission,
  Extrinsic,
  PriceFeedMinute,
} from "../../../types";
import { CorrectSubstrateBlock } from "../../mappingHandlers";
import { roundPrice } from "../../../utils";

export async function handleHourData(
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
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour

  let hourDataRecord = await CollectiveHourData.get(hourId.toString());
  if (hourDataRecord === undefined || hourDataRecord === null) {
    hourDataRecord = CollectiveHourData.create({
      id: hourId.toString(),
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
      prevHourDataId: prevHourId.toString(),
    });
  }

  hourDataRecord.avgAvailPrice =
    (hourDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  hourDataRecord.avgEthPrice =
    (hourDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  hourDataRecord.endBlock = block.block.header.number.toNumber();
  hourDataRecord.timestampLast = block.timestamp;

  const totalFeeUSD = totalFee * priceFeed.availPrice;
  hourDataRecord.totalFees = hourDataRecord.totalFees! + totalFee;
  hourDataRecord.totalFeesAvail = hourDataRecord.totalFeesAvail! + totalFee;
  hourDataRecord.totalFeesUSD = hourDataRecord.totalFeesUSD! + totalFeeUSD;
  if (daSubmissionsLength > 0) {
    const daFeesUSD = daFees * priceFeed.availPrice;
    hourDataRecord.totalDataBlocksCount =
      hourDataRecord.totalDataBlocksCount! + 1;
    hourDataRecord.totalDAFees = hourDataRecord.totalDAFees! + daFees;
    hourDataRecord.totalDAFeesUSD = hourDataRecord.totalDAFeesUSD! + daFeesUSD;
    hourDataRecord.totalDataSubmissionCount =
      hourDataRecord.totalDataSubmissionCount! + daSubmissionsLength;
    hourDataRecord.totalByteSize = hourDataRecord.totalByteSize! + daSize || 0;
  }
  hourDataRecord.totalBlocksCount = hourDataRecord.totalBlocksCount! + 1;
  hourDataRecord.totalExtrinsicCount = hourDataRecord.totalExtrinsicCount! + 1;
  await hourDataRecord.save();
}

export async function handleAccountHourData(
  extrinsicRecord: Extrinsic,
  extrinsic: Omit<SubstrateExtrinsic, "events" | "success">,
  priceFeed: PriceFeedMinute,
  type: number = 0,
  appRecord?: AppEntity
) {
  const block = extrinsic.block as CorrectSubstrateBlock;

  const blockDate = new Date(Number(block.timestamp.getTime()));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  const ext = extrinsic.extrinsic;
  const id =
    type === 1
      ? `${extrinsicRecord.signer.toString()}-hourId-${hourId}-${appRecord!.id}`
      : `${extrinsicRecord.signer.toString()}-hourId-${hourId}`;
  const idPrev =
    type === 1
      ? `${extrinsicRecord.signer.toString()}-hourId-${prevHourId}-${
          appRecord!.id
        }`
      : `${extrinsicRecord.signer.toString()}-hourId-${prevHourId}`;
  const methodData = ext.method;
  let dataSubmissionSize =
    methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
  let accountHourDataRecord = await AccountHourData.get(id);
  const oneMbInBytes = 1_048_576;
  const feesPerMb =
    (extrinsicRecord.feesRounded! / dataSubmissionSize) * oneMbInBytes;
  if (accountHourDataRecord === undefined || accountHourDataRecord === null) {
    accountHourDataRecord = AccountHourData.create({
      id: id,
      accountId: extrinsicRecord.signer.toString(),

      timestampLast: extrinsicRecord.timestamp,
      totalByteSize: 0,
      timestampStart: extrinsicRecord.timestamp,
      prevHourDataId: idPrev,
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
    accountHourDataRecord.appId = appRecord!.id;
    accountHourDataRecord.attachedAppId = appRecord!.id;
  }

  //  {"nonce":3014,"consumers":0,"providers":1,"sufficients":0,"data":{"free":"0x0000000000001f3f5392a7503702c202","reserved":0,"frozen":0,"flags":"0x80000000000000000000000000000000"}}
  // @ts-ignore
  const { data: balance } = (await // @ts-ignore
  (api as any).query.system.account(extrinsicRecord.signer.toString())) as any;
  const { feeFrozen, free, miscFrozen, reserved, frozen } = balance;

  let balanceFrozen: bigint | undefined = undefined;
  if (frozen) {
    balanceFrozen = frozen.toBigInt();
  } else {
    if (miscFrozen && feeFrozen) {
      const balanceFrozenMisc = miscFrozen.toBigInt();
      const balanceFrozenFee = feeFrozen.toBigInt();
      balanceFrozen =
        balanceFrozenFee > balanceFrozenMisc
          ? balanceFrozenFee
          : balanceFrozenMisc;
    } else if (miscFrozen) {
      balanceFrozen = miscFrozen.toBigInt();
    } else if (feeFrozen) {
      balanceFrozen = feeFrozen.toBigInt();
    }
  }
  const balanceReserved = reserved.toBigInt();
  const balanceFree = free.toBigInt();
  const amountFrozen = balanceFrozen ? balanceFrozen.toString() : "0";
  const amountTotal = (balanceFree + balanceReserved).toString();
  const amount = balanceFrozen
    ? (balanceFree - balanceFrozen).toString()
    : balanceFree.toString();
  accountHourDataRecord.amount = amount;
  accountHourDataRecord.amountFrozen = amountFrozen;
  accountHourDataRecord.amountTotal = amountTotal;
  accountHourDataRecord.amountRounded = roundPrice(
    accountHourDataRecord.amount!
  );
  accountHourDataRecord.amountFrozenRounded = roundPrice(
    accountHourDataRecord.amountFrozen
  );
  accountHourDataRecord.amountTotalRounded = roundPrice(
    accountHourDataRecord.amountTotal!
  );
  accountHourDataRecord.balanceFree = Number(balanceFree);
  accountHourDataRecord.balanceReserved = Number(balanceReserved);
  accountHourDataRecord.timestampLast = extrinsicRecord.timestamp;

  accountHourDataRecord.avgAvailPrice =
    (accountHourDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  accountHourDataRecord.avgEthPrice =
    (accountHourDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  const extrinsicType = `${methodData.section}_${methodData.method}`;
  const isDataSubmission = extrinsicType === "dataAvailability_submitData";
  const fees = Number(extrinsicRecord.fees);
  const feesUSD = fees * priceFeed.availPrice;
  if (isDataSubmission) {
    accountHourDataRecord.totalDAFees =
      accountHourDataRecord.totalDAFees! + Number(extrinsicRecord.fees)!;
    accountHourDataRecord.totalDAFeesUSD =
      accountHourDataRecord.totalDAFeesUSD! + feesUSD;
    accountHourDataRecord.totalDataSubmissionCount =
      accountHourDataRecord.totalDataSubmissionCount! + 1;
    accountHourDataRecord.totalByteSize =
      accountHourDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      accountHourDataRecord.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      accountHourDataRecord.totalDataBlocksCount =
        accountHourDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    accountHourDataRecord.endBlock!.toString() !=
    block.block.header.number.toNumber().toString()
  ) {
    accountHourDataRecord.totalBlocksCount =
      accountHourDataRecord.totalBlocksCount! + 1;
  }
  accountHourDataRecord.totalExtrinsicCount =
    accountHourDataRecord.totalExtrinsicCount! + 1;
  accountHourDataRecord.totalFees =
    accountHourDataRecord.totalFees! + Number(extrinsicRecord.fees!);
  accountHourDataRecord.totalFeesAvail =
    accountHourDataRecord.totalFeesAvail! + Number(extrinsicRecord.fees!);
  accountHourDataRecord.totalFeesUSD =
    accountHourDataRecord.totalFeesUSD! + Number(feesUSD);
  accountHourDataRecord.lastPriceFeedId = priceFeed.id;
  accountHourDataRecord.endBlock = block.block.header.number.toNumber();
  accountHourDataRecord.collectiveHourDataId = hourId?.toString();

  await accountHourDataRecord.save();
}
