import { SubstrateExtrinsic } from "@subql/types";
import {
  AccountHourData,
  AppEntity,
  AppHourData,
  CollectiveDayData,
  CollectiveHourData,
  DataSubmission,
  Extrinsic,
  PriceFeedMinute,
} from "../../../types";
import { CorrectSubstrateBlock } from "../../mappingHandlers";

export async function handleAppHourData(
  extrinsicRecord: Extrinsic,
  extrinsic: Omit<SubstrateExtrinsic, "events" | "success">,
  priceFeed: PriceFeedMinute,
  appRecord: AppEntity
) {
  const block = extrinsic.block as CorrectSubstrateBlock;

  const blockDate = new Date(Number(block.timestamp.getTime()));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  const dayId = Math.floor(blockDate.getTime() / 86400000);
  const prevDayId = dayId - 1;
  const hourId = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
  const prevHourId = hourId - 1; // Divide by milliseconds in an hour
  const ext = extrinsic.extrinsic;

  const methodData = ext.method;
  let dataSubmissionSize =
    methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
  let appHourDataRecord = await AppHourData.get(
    `${appRecord.id}-hourId-${hourId}`
  );
  const oneMbInBytes = 1_048_576;
  const feesPerMb =
    (extrinsicRecord.feesRounded! / dataSubmissionSize) * oneMbInBytes;
  if (appHourDataRecord === undefined || appHourDataRecord === null) {
    appHourDataRecord = AppHourData.create({
      id: `${appRecord.id}-hourId-${hourId}`,
      appId: appRecord.id,
      totalDataAccountsCount: 0,
      timestampLast: extrinsicRecord.timestamp,
      totalByteSize: 0,
      timestampStart: extrinsicRecord.timestamp,
      prevHourDataId: `${appRecord.id}-hourId-${prevHourId}`,
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
    });
  }

  appHourDataRecord.timestampLast = extrinsicRecord.timestamp;

  appHourDataRecord.avgAvailPrice =
    (appHourDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  appHourDataRecord.avgEthPrice =
    (appHourDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  const extrinsicType = `${methodData.section}_${methodData.method}`;
  const isDataSubmission = extrinsicType === "dataAvailability_submitData";
  const fees = Number(extrinsicRecord.fees);
  const feesUSD = fees * priceFeed.availPrice;
  if (isDataSubmission) {
    appHourDataRecord.totalDAFees =
      appHourDataRecord.totalDAFees! + Number(extrinsicRecord.fees)!;
    appHourDataRecord.totalDAFeesUSD =
      appHourDataRecord.totalDAFeesUSD! + feesUSD;
    appHourDataRecord.totalDataSubmissionCount =
      appHourDataRecord.totalDataSubmissionCount! + 1;
    appHourDataRecord.totalByteSize =
      appHourDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      appHourDataRecord.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      appHourDataRecord.totalDataBlocksCount =
        appHourDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    appHourDataRecord.endBlock!.toString() !=
    block.block.header.number.toNumber().toString()
  ) {
    appHourDataRecord.totalBlocksCount =
      appHourDataRecord.totalBlocksCount! + 1;
  }
  appHourDataRecord.totalExtrinsicCount =
    appHourDataRecord.totalExtrinsicCount! + 1;
  appHourDataRecord.totalFees =
    appHourDataRecord.totalFees! + Number(extrinsicRecord.fees!);
  appHourDataRecord.totalFeesAvail =
    appHourDataRecord.totalFeesAvail! + Number(extrinsicRecord.fees!);
  appHourDataRecord.totalFeesUSD =
    appHourDataRecord.totalFeesUSD! + Number(feesUSD);
  appHourDataRecord.lastPriceFeedId = priceFeed.id;
  appHourDataRecord.endBlock = block.block.header.number.toNumber();
  appHourDataRecord.collectiveHourDataId = hourId?.toString();

  await appHourDataRecord.save();
}
