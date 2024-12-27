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

export async function handleAppDayData(
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
  const ext = extrinsic.extrinsic;

  const methodData = ext.method;
  let dataSubmissionSize =
    methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
  let appDayDataRecord = await AppDayData.get(`${appRecord.id}-dayId-${dayId}`);
  const oneMbInBytes = 1_048_576;
  const feesPerMb =
    (extrinsicRecord.feesRounded! / dataSubmissionSize) * oneMbInBytes;
  if (appDayDataRecord === undefined || appDayDataRecord === null) {
    appDayDataRecord = AppDayData.create({
      id: `${appRecord.id}-dayId-${dayId}`,
      appId: appRecord.id,
      totalDataAccountsCount: 0,
      timestampLast: extrinsicRecord.timestamp,
      totalByteSize: 0,
      timestampStart: extrinsicRecord.timestamp,
      prevDayDataId: `${appRecord.id}-dayId-${prevDayId}`,
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
  appDayDataRecord.timestampLast = extrinsicRecord.timestamp;

  appDayDataRecord.avgAvailPrice =
    (appDayDataRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
  appDayDataRecord.avgEthPrice =
    (appDayDataRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
  const extrinsicType = `${methodData.section}_${methodData.method}`;
  const isDataSubmission = extrinsicType === "dataAvailability_submitData";
  const fees = Number(extrinsicRecord.fees);
  const feesUSD = fees * priceFeed.availPrice;
  if (isDataSubmission) {
    appDayDataRecord.totalDAFees =
      appDayDataRecord.totalDAFees! + Number(extrinsicRecord.fees)!;
    appDayDataRecord.totalDAFeesUSD =
      appDayDataRecord.totalDAFeesUSD! + feesUSD;
    appDayDataRecord.totalDataSubmissionCount =
      appDayDataRecord.totalDataSubmissionCount! + 1;
    appDayDataRecord.totalByteSize =
      appDayDataRecord.totalByteSize + Number(dataSubmissionSize);
    if (
      appDayDataRecord.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      appDayDataRecord.totalDataBlocksCount =
        appDayDataRecord.totalDataBlocksCount! + 1;
    }
  }
  if (
    appDayDataRecord.endBlock!.toString() !=
    block.block.header.number.toNumber().toString()
  ) {
    appDayDataRecord.totalBlocksCount = appDayDataRecord.totalBlocksCount! + 1;
  }
  appDayDataRecord.totalExtrinsicCount =
    appDayDataRecord.totalExtrinsicCount! + 1;
  appDayDataRecord.totalFees =
    appDayDataRecord.totalFees! + Number(extrinsicRecord.fees!);
  appDayDataRecord.totalFeesAvail =
    appDayDataRecord.totalFeesAvail! + Number(extrinsicRecord.fees!);
  appDayDataRecord.totalFeesUSD =
    appDayDataRecord.totalFeesUSD! + Number(feesUSD);
  appDayDataRecord.lastPriceFeedId = priceFeed.id;
  appDayDataRecord.endBlock = block.block.header.number.toNumber();
  appDayDataRecord.collectiveDayDataId = dayId?.toString();

  await appDayDataRecord.save();
}
