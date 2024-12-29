import { SubstrateExtrinsic } from "@subql/types";
import {
  AccountBalance,
  AccountBalanceDayData,
  AccountBalanceHourData,
  AccountEntity,
  AppEntity,
  Extrinsic,
  PriceFeedMinute,
} from "../../types";
import { CorrectSubstrateBlock } from "../mappingHandlers";
import { Balance } from "@polkadot/types/interfaces";
import { roundPrice } from "../../utils";

type AccountData = {
  free: Balance;
  reserved: Balance;
  frozen: Balance;
  miscFrozen: Balance; // Old structure
  feeFrozen: Balance; // Old structure
};
export async function handleAccountBalancesBulk(
  block: CorrectSubstrateBlock,
  priceFeed: PriceFeedMinute
) {
  const accounts = block.block.extrinsics?.map((ext) => {
    return ext.signer.toString();
  });
  await updateBalanceAccounts(accounts, block.timestamp, priceFeed, block);
}
export const updateBalanceAccounts = async (
  addresses: string[],
  timestamp: Date,
  priceFeed: PriceFeedMinute,
  block: CorrectSubstrateBlock
) => {
  try {
    const blockNumber = block.block.header.number.toNumber();
    const accountsInDb: AccountBalance[] = await store.getByFields(
      "AccountBalance",
      [["accountId", "in", addresses]],
      {
        limit: addresses.length,
      }
    );

    // @ts-ignore
    const res = (await (api as any).query.system.account.multi(
      addresses
    )) as any;

    for (let index = 0; index < res?.length; index++) {
      const { data: balance }: { data: AccountData } = res[index];
      if (balance) {
        let isNew = false;
        const { feeFrozen, free, miscFrozen, reserved, frozen } = balance;
        const address = addresses[index];
        const date = new Date();

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
        let record = accountsInDb.find((x) => x.id === address);
        if (!record) {
          record = AccountBalance.create({
            id: address,
            accountId: address,
            timestampLast: timestamp,
            timestampStart: timestamp,
            startBlock: blockNumber,
          });
          isNew = true;
        }
        record.amount = amount;
        record.amountFrozen = amountFrozen;
        record.amountTotal = amountTotal;
        record.amountRounded = roundPrice(record.amount);
        record.amountFrozenRounded = roundPrice(record.amountFrozen);
        record.amountTotalRounded = roundPrice(record.amountTotal);
        record.balanceFree = Number(balanceFree);
        record.balanceReserved = Number(balanceReserved);
        record.timestampLast = timestamp;
        record.endBlock = blockNumber;
        record.lastPriceFeedId = priceFeed.id;

        //   HANDLE DAY DATA
        const blockDate = new Date(Number(timestamp.getTime()));
        const minuteId = Math.floor(blockDate.getTime() / 60000);
        const dayNum = Math.floor(blockDate.getTime() / 86400000);
        const prevDayId = dayNum - 1;
        const dayId = `${address.toString()}-dayId-${dayNum}`;
        const dayidPrev = `${address.toString()}-dayId-${prevDayId}`;
        let accountDayRecord = await AccountBalanceDayData.get(
          dayId.toString()
        );
        if (!accountDayRecord) {
          accountDayRecord = AccountBalanceDayData.create({
            accountBalanceId: address,
            accountId: address,
            id: dayId.toString(),
            timestampLast: timestamp,
            timestampStart: timestamp,
          });
        }
        accountDayRecord.amount = amount;
        accountDayRecord.amountFrozen = amountFrozen;
        accountDayRecord.amountTotal = amountTotal;
        accountDayRecord.amountRounded = roundPrice(record.amount);
        accountDayRecord.amountFrozenRounded = roundPrice(record.amountFrozen);
        accountDayRecord.amountTotalRounded = roundPrice(record.amountTotal);
        accountDayRecord.balanceFree = Number(balanceFree);
        accountDayRecord.balanceReserved = Number(balanceReserved);
        accountDayRecord.timestampLast = timestamp;
        accountDayRecord.endBlock = blockNumber;
        accountDayRecord.lastPriceFeedId = priceFeed.id;
        accountDayRecord.prevDayDataId = dayidPrev.toString();

        //   HANDLE HOUR DATA

        const hourNum = Math.floor(blockDate.getTime() / 3600000); // Divide by milliseconds in an hour
        const prevHourId = hourNum - 1; // Divide by milliseconds in an hour

        const hourid = `${address.toString()}-hourId-${hourNum}`;
        const houridPrev = `${address.toString()}-hourId-${prevHourId}`;
        let accountHourRecord = await AccountBalanceHourData.get(
          hourid.toString()
        );
        if (!accountHourRecord) {
          accountHourRecord = AccountBalanceHourData.create({
            accountBalanceId: address,
            accountId: address,
            id: hourid,
            timestampLast: timestamp,
            timestampStart: timestamp,
          });
        }
        accountHourRecord.amount = amount;
        accountHourRecord.amountFrozen = amountFrozen;
        accountHourRecord.amountTotal = amountTotal;
        accountHourRecord.amountRounded = roundPrice(record.amount);
        accountHourRecord.amountFrozenRounded = roundPrice(record.amountFrozen);
        accountHourRecord.amountTotalRounded = roundPrice(record.amountTotal);
        accountHourRecord.balanceFree = Number(balanceFree);
        accountHourRecord.balanceReserved = Number(balanceReserved);
        accountHourRecord.timestampLast = timestamp;
        accountHourRecord.endBlock = blockNumber;
        accountHourRecord.lastPriceFeedId = priceFeed.id;
        accountHourRecord.prevHourDataId = houridPrev.toString();
        Promise.all([
          await record.save(),
          await accountDayRecord.save(),
          await accountHourRecord.save(),
        ]);
        // if (isNew) {
        //   accountsToCreate.push(record);
        // } else {
        //   accountsToUpdate.push(record);
        // }
      } else {
        logger.warn("Error in update account : Balance not found");
      }
    }
  } catch (err: any) {
    throw err;
    logger.error("Error in update account : " + err.toString());
    if (err.sql)
      logger.error("Error in update account : " + JSON.stringify(err.sql));
    return {
      accountsToCreate: [],
      accountsToUpdate: [],
    };
  }
};
