import { SubstrateExtrinsic } from "@subql/types";
import {
  AppEntity,
  AppLookupBaseData,
  Extrinsic,
  PriceFeedMinute,
} from "../../types";
import { CorrectSubstrateBlock } from "../mappingHandlers";
import { formatInspect } from "../../utils/inspect";
import { hexToUTF8 } from "../../utils";
import { handleAccount } from "./accountData";
import { handleAccountDayData } from "../intervals/day/handleDayData";
import { handleAppDayData } from "../intervals/day/handleAppDayData";
import { handleAppHourData } from "../intervals/hour/handleAppHourData";
import { handleAccountHourData } from "../intervals/hour/handleHourData";

export interface ApplicationData {
  name: string;
  id: number;
  owner: string;
}
export async function handleApp(
  extrinsicRecord: Extrinsic,
  extrinsic: Omit<SubstrateExtrinsic, "events" | "success">,
  priceFeed: PriceFeedMinute,
  extraDetails:
    | {
        nbEvents: number;
        success?: boolean | undefined;
        fee?: string | undefined;
        feeRounded?: number | undefined;
        events?: any[];
      }
    | undefined
) {
  const block = extrinsic.block as CorrectSubstrateBlock;
  const ext = extrinsic.extrinsic;
  const methodData = ext.method;

  if (methodData.section === "dataAvailability") {
    let dataSubmissionSize =
      methodData.args.length > 0 ? methodData.args[0].toString().length / 2 : 0;
    const formattedInspect = formatInspect(ext.inspect());
    const filteredRaw = formattedInspect.map((x) => {
      return { ...x, data: "" };
    });
    const raw = extraDetails ? extraDetails.events : [];
    const appIdInspect = formattedInspect.find((x) => x.name === "appId");
    const nameInspect = formattedInspect.find((x) => x.name === "key");

    // const appName = formattedInspect.find((x) => x.name === "name");
    const keyIndexFromArgs = extrinsicRecord.argsName?.findIndex(
      (v) => v === "key"
    );
    const valueFromArgs =
      extrinsicRecord.argsValue.length >= keyIndexFromArgs
        ? extrinsicRecord.argsValue[keyIndexFromArgs]
        : null;
    const appId = appIdInspect ? Number(appIdInspect.value) : -1;
    let appRecord = await AppEntity.get(appId.toString());
    // Handle new app
    if (appRecord === null || appRecord === undefined) {
      // @ts-ignore
      // const entries = await api.query.dataAvailability.appKeys.entries();

      // const data: ApplicationData[] = entries.map(([key, value]: any) => {
      //   const name = key.args[0].toHuman() as string;
      //   const appKey = value.toHuman() as {
      //     owner: string;
      //     id: string | number;
      //   };
      //   return {
      //     name,
      //     owner: appKey.owner,
      //     id: Number(appKey.id),
      //   };
      // });

      // @ts-ignore
      const appEntry = await getAppDataFromKeyRPC(appId);
      logger.info(`appKey::: ${JSON.stringify(appEntry)}`);
      const [newAppName = null, newAppOwner = null, newAppId = null] =
        extraDetails!.events && extraDetails!.events?.length > 0
          ? extraDetails!.events[0]
          : [];
      const appNameKey = newAppName
        ? hexToUTF8(newAppName as string)
        : "Unknown";

      appRecord = AppEntity.create({
        id: newAppId ? newAppId?.toString() : appId.toString(),
        name: valueFromArgs
          ? hexToUTF8(valueFromArgs)
          : appEntry
          ? appEntry?.name!
          : appNameKey,
        owner: newAppOwner
          ? newAppOwner
          : appEntry?.owner
          ? appEntry?.owner
          : ext.signer.toString(),
        creationRawData: JSON.stringify({ ...raw, appEntry }),
        createdAt: block.timestamp,
        timestampCreation: extrinsicRecord.timestamp,
        timestampLast: extrinsicRecord.timestamp,
        totalByteSize: 0,
        updatedAt: extrinsicRecord.timestamp,
        avgAvailPrice: extrinsicRecord.availPrice,
        avgEthPrice: extrinsicRecord.ethPrice,
        totalDAFees: 0,
        totalDAFeesUSD: 0,
        totalDataSubmissionCount: 0,
        totalDataBlocksCount: 0,
        totalBlocksCount: 0,
        totalExtrinsicCount: 0,
        totalFeesAvail: 0,
        totalFeesUSD: 0,
        totalTransferCount: 0,
        lastPriceFeedId: priceFeed.id,
        endBlock: 0,
        startBlock: block.block.header.number.toNumber(),
        creationExtId: extrinsicRecord.id,
      });
    }

    appRecord.timestampLast = extrinsicRecord.timestamp;

    appRecord.updatedAt = extrinsicRecord.timestamp;
    appRecord.avgAvailPrice =
      (appRecord.avgAvailPrice! + priceFeed.availPrice) / 2;
    appRecord.avgEthPrice = (appRecord.avgEthPrice! + priceFeed.ethPrice) / 2;
    const extrinsicType = `${methodData.section}_${methodData.method}`;
    const isDataSubmission = extrinsicType === "dataAvailability_submitData";
    const fees = Number(extrinsicRecord.fees);
    const feesUSD = fees * priceFeed.availPrice;

    if (isDataSubmission) {
      appRecord.totalDAFees =
        appRecord.totalDAFees! + Number(extrinsicRecord.fees)!;
      appRecord.totalDAFeesUSD = appRecord.totalDAFeesUSD! + feesUSD;
      appRecord.totalDataSubmissionCount =
        appRecord.totalDataSubmissionCount! + 1;

      appRecord.totalByteSize =
        appRecord.totalByteSize + Number(dataSubmissionSize);
      if (
        appRecord.endBlock!.toString() !=
        block.block.header.number.toNumber().toString()
      ) {
        appRecord.totalDataBlocksCount = appRecord.totalDataBlocksCount! + 1;
      }
    }

    if (
      appRecord.endBlock!.toString() !=
      block.block.header.number.toNumber().toString()
    ) {
      appRecord.totalBlocksCount = appRecord.totalBlocksCount! + 1;
    }
    appRecord.totalExtrinsicCount = appRecord.totalExtrinsicCount! + 1;
    appRecord.totalFeesAvail =
      appRecord.totalFeesAvail! + Number(extrinsicRecord.fees!);
    appRecord.totalFeesUSD = appRecord.totalFeesUSD! + Number(feesUSD);
    appRecord.lastPriceFeedId = priceFeed.id;
    appRecord.endBlock = block.block.header.number.toNumber();
    // logger.info(`New ACCOUNT SAVE::::::  ${JSON.stringify(appRecord)}`);
    // APP ACCOUNT HANDLE WITH   type: number = 0,  appRecord?: AppEntity
    await Promise.all([
      await handleAppDayData(extrinsicRecord, extrinsic, priceFeed, appRecord),
      await handleAppHourData(extrinsicRecord, extrinsic, priceFeed, appRecord),
      await handleAccount(extrinsicRecord, extrinsic, priceFeed, 1, appRecord),

      await handleAccountDayData(
        extrinsicRecord,
        extrinsic,
        priceFeed,
        1,
        appRecord
      ),

      await handleAccountHourData(
        extrinsicRecord,
        extrinsic,
        priceFeed,
        1,
        appRecord
      ),
      await appRecord.save(),
    ]);
  }
}

export async function getAppDataFromKeyRPC(id: number) {
  let appDataFromStore = await AppLookupBaseData.get(id.toString());

  if (!appDataFromStore) {
    // @ts-ignore
    const entries = await api.query.dataAvailability.appKeys.entries();

    const data: ApplicationData[] = entries.map(([key, value]: any) => {
      const name = key.args[0].toHuman() as string;
      const appKey = value.toHuman() as {
        owner: string;
        id: string | number;
      };
      return {
        name,
        owner: appKey.owner,
        id: Number(appKey.id),
      };
    });
    const appEntries: AppLookupBaseData[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      let appEntry = await AppLookupBaseData.get(element.id.toString());
      if (!appEntry) {
        appEntry = AppLookupBaseData.create({
          id: element.id.toString(),
          appId: element.id.toString(),
          key: Number(element.id),
          name: element.name,
          owner: element.owner,
        });
      }
      appEntry.appId = element.id.toString();
      appEntry.key = Number(element.id);
      appEntry.name = element.name;
      appEntry.owner = element.owner;
      if (element.id.toString() === id?.toString()) {
        appDataFromStore = appEntry;
      }
      appEntries.push(appEntry);
    }
    await Promise.all([store.bulkUpdate("AppLookupBaseData", appEntries)]);
    // @ts-ignore
    // const appEntry = data?.find((app) => app.id === appId);
  }
  return appDataFromStore;
}
