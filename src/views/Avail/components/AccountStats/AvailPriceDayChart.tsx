"use client";
import ChartLoading from "@/components/Skeletons/ChartLoading";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_PRICE_DAY_DATAS_QUERY } from "@/lib/apollo/queriesAvail";
import { formatDateDDMM } from "@/lib/time";
import { cn, formatBytes, getRandomNumber } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export default function AvailPriceDayChart({ duration }: { duration: number }) {
  const { data, loading } = useQuery(AVAIL_PRICE_DAY_DATAS_QUERY, {
    variables: {
      duration,
    },
    client: availClient,
  });
  console.log(`🚀 ~ file: AvailPriceDayChart.tsx:38 ~ data:`, data);

  const chartData = useMemo(() => {
    const datas = data?.collectiveDayData?.nodes
      ?.map((bd: any) => {
        return {
          ...bd,
          sizeValue: Number(bd?.totalByteSize),
          feeValueAvail: new BigNumber(Number(bd?.totalDAFees)).toFormat(8),
          size: formatBytes(Number(bd?.totalByteSize)),
          timestamp: dateString.format(new Date(bd?.timestampStart)),
          timestamp2: formatDateDDMM(new Date(bd?.timestampStart)),
          totalDataSubmissionCount: Number(bd?.totalDataSubmissionCount),
          totalDataSubmissionCountCh: Number(bd?.totalBlobHashesCount) / 10,
          avgEthPrice: Number(bd?.avgEthPrice),
          avgAvailPrice: Number(bd?.avgAvailPrice),
          totalBlobGasUSD: new BigNumber(Number(bd?.totalDAFeesUSD)).toNumber(),
          totalBlobGasUSDF: new BigNumber(Number(bd?.totalDAFeesUSD)).toFormat(
            2
          ),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.collectiveDayData]);

  const diffPercent = useMemo(() => {
    if (chartData) {
      const todayData = chartData.at(-1);
      const prevDayData = chartData.at(-2);
      const difference = todayData?.avgAvailPrice - prevDayData?.avgAvailPrice;
      const percentage = (difference / prevDayData?.avgAvailPrice) * 100;
      return percentage.toFixed(2); // Return formatted to 2 decimal places
    }
    return 0;
  }, [chartData]);

  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="w-full h-full h-[20em]   flex justify-between flex-col">
      <div className="flex   lg:justify-between lg:flex-nowrap flex-wrap lg:gap-2 gap-4  pb-4 border-b border-base-200">
        <div className="">
          <div className=" ">
            <div className=" w-full h-full text-sm leading-none flex items-center gap-2 ">
              <p className=" w-[10px] h-[10px] bg-[#8884d8]"></p>
              <p className="opacity-80 ">AVAIL Price [Today]</p>
            </div>
            <div>
              <p className=" leading-6 font-bold">
                <span className="font-normal">$</span>{" "}
                {chartData
                  ? new BigNumber(chartData?.at(-1)?.avgAvailPrice)?.toFormat(2)
                  : "0"}{" "}
                <span
                  className={cn(
                    "text-xs",
                    Number(diffPercent) > 0 ? "text-success" : "",
                    Number(diffPercent) < 0 ? "text-error" : "",
                    Number(diffPercent) == 0 ? "text-current opacity-80" : "",
                    isNaN(Number(diffPercent)) ? "text-current opacity-80" : ""
                  )}
                >
                  {isNaN(Number(diffPercent)) ? 0 : diffPercent}%
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="">
          <div className=" ">
            <div className=" w-full h-full text-sm leading-none flex items-center gap-2 ">
              <p className=" w-[10px] h-[10px] bg-current"></p>
              <p className="opacity-80 ">Subs Count</p>
            </div>

            <div>
              <p className=" leading-6 font-bold">
                {chartData
                  ? new BigNumber(
                      chartData?.at(-1)?.totalDataSubmissionCount
                    )?.toFormat()
                  : "0"}{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="">
          <div className=" ">
            <div className=" w-full h-full  text-sm leading-none flex items-center gap-2 ">
              <p className=" w-[10px] h-[10px] bg-[orange]"></p>
              <p className="opacity-80 ">DA Fees</p>
            </div>

            <div>
              <p className=" leading-6 font-bold">
                <span className="font-normal">$</span>{" "}
                {chartData ? chartData?.at(-1)?.totalBlobGasUSDF : "0"}{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="">
          <div className=" ">
            <div className=" w-full h-full opacity-80 text-sm leading-none flex items-center gap-2 ">
              Data Size
            </div>

            <div>
              <p className=" leading-6 font-bold">
                {chartData ? chartData?.at(-1)?.size : "0"}{" "}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 30, right: 5, left: 0, bottom: 10 }}
        >
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

          <XAxis
            dataKey={"timestamp2"}
            className="text-[10px] !text-current"
            angle={-45}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
            tickMargin={10}
          />
          <Tooltip
            content={CustomTooltipRaw}
            cursor={{
              fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))",
              opacity: 0.1,
            }}
          />
          <Area
            type="monotone"
            dataKey="totalDataSubmissionCount"
            stroke="currentColor"
            fill="none"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="totalBlobGasUSD"
            stroke="orange"
            fill="none"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="avgAvailPrice"
            stroke="#8884d8"
            fillOpacity={1}
            strokeWidth={2}
            // fill="url(#colorUvAccStatCard)"
            fill="none"
          />
        </AreaChart>
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
            {`${payload[0]?.payload?.timestamp}`}
          </p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          <p className=" ">
            AVAIL Price :{" "}
            {`$${new BigNumber(payload[0]?.payload?.avgAvailPrice)?.toFormat(2)}`}{" "}
          </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">
            Subs Count :{" "}
            {`${new BigNumber(payload[0]?.payload?.totalDataSubmissionCount).toFormat()}`}{" "}
          </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">Data Size : {`${payload[0]?.payload?.size}`} </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">
            DA Fee : ${`${payload[0]?.payload?.totalBlobGasUSDF}`}{" "}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
