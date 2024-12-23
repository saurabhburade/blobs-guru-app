import * as echarts from "echarts";
import {
  Coins,
  Database,
  DollarSign,
  HardDriveUpload,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { cn, formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useQuery } from "@apollo/client";
import { ACCOUNT_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ImageWithFallback from "@/components/ImageWithFallback";
import { AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY } from "@/lib/apollo/queriesAvail";
import { availClient } from "@/lib/apollo/client";

type Props = {};
function AvailAccountStatCard({ acc, isLoading, className }: any) {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalByteSize));
  }, [acc?.totalByteSize]);
  const totalFeesAvail = useMemo(() => {
    return new BigNumber(Number(acc?.totalFees || 0)).toFormat(4);
  }, [acc?.totalFees]);

  return (
    <div
      className={cn(
        "bg-base-100/80 border-base-300/30 border rounded-lg ",
        className ? className : ""
      )}
    >
      <div className="flex gap-2 items-center border-b border-base-200/50  h-[4em] p-4">
        {isLoading && (
          <>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
          </>
        )}
        {!isLoading && (
          <>
            <User
              width={40}
              height={40}
              className="bg-base-200 p-2 rounded-lg"
            />

            <Link href={`/accounts/${acc?.id}`}>
              {accountDetails?.name ? (
                <p className=""> {accountDetails?.name}</p>
              ) : (
                <>
                  <p className="hidden lg:block"> {acc?.id}</p>
                  <p className="lg:hidden block"> {formatAddress(acc?.id)}</p>
                </>
              )}
            </Link>
          </>
        )}
      </div>
      <div className=" grid lg:grid-cols-2">
        {isLoading && (
          <div className="border-r border-x-base-200/50">
            {new Array(4).fill(1)?.map((num, idx) => {
              return (
                <div
                  className="flex justify-between items-center p-4 py-4"
                  key={`AccountStatCard_${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[2em] h-[2em] animate-pulse"></div>

                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
                  </div>

                  <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[2em] lg:w-[5em] lg:w-[10em] h-[22px] animate-pulse"></div>
                </div>
              );
            })}
          </div>
        )}
        {!isLoading && (
          <div className="border-r border-x-base-200/50">
            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <NotepadText />
                <p className=""> Extrinsic Count</p>
              </div>
              <p className="text-xl font-bold">
                {new BigNumber(
                  Number(acc?.totalExtrinsicCount || 0)
                )?.toFormat()}
              </p>
            </div>
            <div className="flex justify-between items-center py-3 p-4">
              <div className="flex items-center gap-2">
                <Coins />

                <p className=""> Total fee</p>
              </div>
              <p className="text-xl font-bold"> {totalFeesAvail} AVAIL</p>
            </div>
            <div className="flex justify-between items-center py-3 p-4">
              <div className="flex items-center gap-2">
                <Database />

                <p className=""> DA size</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobSize} </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <HardDriveUpload />
                <p className=""> Total DA subs</p>
              </div>
              <p className="text-xl font-bold">
                {" "}
                {new BigNumber(
                  Number(acc?.totalDataSubmissionCount || 0)
                )?.toFormat()}
              </p>
            </div>

            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
                  width={24}
                  height={24}
                  alt="avail"
                />
                <p className=""> DA Fees</p>
              </div>
              <p className="text-xl font-bold">
                {new BigNumber(Number(acc?.totalDAFees || 0))?.toFormat(4)}{" "}
                AVAIL
              </p>
            </div>
          </div>
        )}
        <div className="p-5  bg-base-100/50    border-base-300/20 w-full ">
          {acc?.id && !isLoading && <AccountExtChart account={acc?.id} />}
        </div>
      </div>
    </div>
  );
}

export default AvailAccountStatCard;
const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const AccountExtChart = ({ account }: { account: string }) => {
  const { data } = useQuery(AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY, {
    variables: {
      address: account,
      duration: 15,
    },
    client: availClient,
  });

  const chartData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.accountDayData?.nodes?.map((rawData: any) => {
      const day = formatter.format(new Date(rawData?.timestampStart));

      return {
        ...rawData,

        sizeValue: Number(rawData?.totalExtrinsicCount),
        size: formatBytes(Number(rawData?.totalByteSize)),
        formattedAddress: formatAddress(rawData?.accountId),
        totalExtrinsicCount: rawData?.totalExtrinsicCount?.toString(),
        totalFeeAvail: new BigNumber(rawData?.totalFees).toFormat(4),
        totalExtrinsicCountF: new BigNumber(
          rawData?.totalExtrinsicCount
        ).toFormat(),
        timestamp: day,
        timestampF: dateString.format(new Date(rawData?.timestampStart)),
        timestamp2: new Date(rawData?.timestampStart).toDateString(),
      };
    });
    return datas?.reverse();
  }, [data?.accountDayData]);

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorUvAccStatCard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Legend
          verticalAlign="top"
          content={() => (
            <span className="text-xs">Last 15 days ext count</span>
          )}
        />
        <Tooltip content={CustomTooltipRaw} />
        <Area
          type="monotone"
          dataKey="sizeValue"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUvAccStatCard)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-100 border border-base-200 lg:w-[20em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between w-full ">
          <p className="h-full  flex justify-between w-full">
            {`${payload[0]?.payload?.timestampF}`}
          </p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          <p className=" ">
            Ext Count: {`${payload[0]?.payload?.totalExtrinsicCountF}`}{" "}
          </p>
          <p className=" ">
            Fee : {`${payload[0]?.payload?.totalFeeAvail}`} AVAIL
          </p>
        </div>
      </div>
    );
  }

  return null;
};
