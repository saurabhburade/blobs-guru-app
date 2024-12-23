import ChartLoading from "@/components/Skeletons/ChartLoading";
import { availClient } from "@/lib/apollo/client";
import {
  ACCOUNT_DAY_DATAS_QUERY,
  ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
} from "@/lib/apollo/queries";
import {
  AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
  AVAIL_DAY_DATAS_WITH_DURATION_QUERY,
} from "@/lib/apollo/queriesAvail";
import { formatDateDDMM } from "@/lib/time";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import _ from "lodash";
import React, { PureComponent, useMemo } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const dateString2 = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
});

export default function AvailDASizeDayChart({
  duration,
}: {
  duration: number;
}) {
  const { data, loading } = useQuery(AVAIL_DAY_DATAS_WITH_DURATION_QUERY, {
    variables: {
      duration: duration,
    },
    client: availClient,
  });
  console.log(`🚀 ~ file: AvailDASizeDayChart.tsx:50 ~ data:`, data);

  const chartData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.collectiveDayData?.nodes?.map((rawData: any) => {
      const day = formatter.format(new Date(rawData?.timestampStart));

      return {
        ...rawData,

        sizeValue: Number(rawData?.totalByteSize),
        totalDataSubmissionCount: Number(rawData?.totalDataSubmissionCount),
        totalDataSubmissionCountF: new BigNumber(
          Number(rawData?.totalDataSubmissionCount)
        ).toFormat(),
        size: formatBytes(Number(rawData?.totalByteSize)),
        formattedAddress: formatAddress(rawData?.id),
        totalExtrinsicCount: Number(rawData?.totalExtrinsicCount),
        totalFeeAvail: new BigNumber(rawData?.totalFees).toFormat(4),
        totalExtrinsicCountF: new BigNumber(
          rawData?.totalExtrinsicCount
        ).toFormat(),
        timestamp: day,
        timestampF: dateString.format(new Date(rawData?.timestampStart)),
        timestamp3: dateString2.format(new Date(rawData?.timestampStart)),
        timestamp2: new Date(rawData?.timestampStart).toDateString(),
      };
    });
    return datas?.reverse();
  }, [data?.collectiveDayData]);

  const cumulativeData = useMemo(() => {
    const totalDataSubmissionCount = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalDataSubmissionCount"
    );
    const totalExtCount = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalExtrinsicCount"
    );
    const totalByteSize = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalByteSize"
    );

    return {
      totalDataSubmissionCountF: new BigNumber(
        totalDataSubmissionCount
      ).toFormat(),
      totalDataSubmissionCount,
      totalExtCountF: new BigNumber(totalExtCount).toFormat(),
      totalExtCount,
      totalByteSize,
      totalByteSizeF: formatBytes(Number(totalByteSize)),
    };
  }, [data?.collectiveDayData]);

  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="h-full w-full row-span-2 ">
      <div className="flex justify-between">
        <p className="text-xs">Byte Size </p>
        <p className="text-xs">
          {cumulativeData?.totalByteSizeF} [{duration} days]
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

          <Bar dataKey="sizeValue" fill="url(#colorUv)" radius={10}></Bar>
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            dataKey="timestamp3"
            className="text-[10px] !text-current"
            angle={-60}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
            tickMargin={10}
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
          <p className=" ">DA Size : {`${payload[0]?.payload?.size}`}</p>
        </div>
      </div>
    );
  }

  return null;
};
