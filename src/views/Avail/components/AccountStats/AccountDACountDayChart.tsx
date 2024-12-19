import ChartLoading from "@/components/Skeletons/ChartLoading";
import { availClient } from "@/lib/apollo/client";
import {
  ACCOUNT_DAY_DATAS_QUERY,
  ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
} from "@/lib/apollo/queries";
import { AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY } from "@/lib/apollo/queriesAvail";
import { formatDateDDMM } from "@/lib/time";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import _ from "lodash";
import React, { PureComponent, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export default function AccountDACountDayChart({
  account,
  duration,
}: {
  account: string;
  duration: number;
}) {
  const { data, loading } = useQuery(
    AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
    {
      variables: {
        address: account,
        duration: duration,
      },
      client: availClient,
    }
  );

  const chartData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.accountDayData?.nodes?.map((rawData: any) => {
      const day = formatter.format(new Date(rawData?.timestampStart));

      return {
        ...rawData,

        sizeValue: Number(rawData?.totalExtrinsicCount),
        totalDataSubmissionCount: Number(rawData?.totalDataSubmissionCount),
        totalDataSubmissionCountF: new BigNumber(
          Number(rawData?.totalDataSubmissionCount)
        ).toFormat(),
        size: formatBytes(Number(rawData?.totalByteSize)),
        formattedAddress: formatAddress(rawData?.accountId),
        totalExtrinsicCount: Number(rawData?.totalExtrinsicCount),
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

  const cumulativeData = useMemo(() => {
    const datas = data?.accountDayData?.nodes
      ?.map((bd: any) => {
        return {
          ...bd,
        };
      })
      ?.reverse();
    const totalDataSubmissionCount = _.sumBy(datas, "totalDataSubmissionCount");

    return {
      totalDataSubmissionCountF: new BigNumber(
        totalDataSubmissionCount
      ).toFormat(),
      totalDataSubmissionCount,
    };
  }, [data?.accountDayData]);

  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="h-full w-full row-span-2 ">
      <div className="flex justify-between">
        <p className="text-xs">DA Subs </p>
        <p className="text-xs">
          {cumulativeData?.totalDataSubmissionCountF} [{duration} days]
        </p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={100}
          data={chartData}
          margin={{ top: 30, right: 30, left: -20, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />

          <Bar
            dataKey="totalDataSubmissionCount"
            fill="url(#colorUv)"
            radius={10}
            // @ts-ignore
            // shape={<TriangleBar />}
            // label={{ position: "top", fontSize: "8px" }}
          ></Bar>
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            dataKey="timestamp2"
            className="text-[10px] !text-current"
            angle={45}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-100 border border-base-200 lg:w-[20em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between w-full ">
          <p className="h-full  flex justify-between w-full">
            {`${payload[0]?.payload?.timestamp2}`}
          </p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          <p className=" ">
            DA Count: {`${payload[0]?.payload?.totalDataSubmissionCountF}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
