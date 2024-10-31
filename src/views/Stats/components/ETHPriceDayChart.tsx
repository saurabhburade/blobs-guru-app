"use client";
import {
  BLOB_DAY_DATAS_QUERY,
  ETH_PRICE_DAY_DATAS_QUERY,
} from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { cn, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
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
  AreaChart,
  Area,
} from "recharts";
const getPath = (
  x: number,
  y: number,
  width: number,
  height: number
): string => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};
const TriangleBar = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};
export default function ETHPriceDayChart({ duration }: { duration: number }) {
  const { data } = useQuery(ETH_PRICE_DAY_DATAS_QUERY, {
    variables: {
      duration,
    },
  });
  // totalBlobTransactionCount;
  // dayStartTimestamp;
  // totalBlobGas;
  // totalBlobAccounts;
  // totalBlobHashesCount;
  const chartData = useMemo(() => {
    const datas = data?.blobsDayDatas
      ?.map((bd: any) => {
        return {
          ...bd,
          sizeValue: Number(bd?.totalFeeEth),
          sizeValueEth: new BigNumber(Number(bd?.totalFeeEth))
            .div(1e18)
            .toFormat(8),
          Size: formatBytes(Number(bd?.totalBlobGas)),
          timestamp: new Date(Number(bd?.dayStartTimestamp) * 1000),
          timestamp2: formatDateDDMM(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          avgEthPrice: Number(bd?.avgEthPrice),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobsDayDatas]);
  const diffPercent = useMemo(() => {
    if (chartData) {
      const todayData = chartData.at(-1);
      const prevDayData = chartData.at(-2);
      const difference = todayData?.avgEthPrice - prevDayData?.avgEthPrice;
      const percentage = (difference / prevDayData?.avgEthPrice) * 100;
      return percentage.toFixed(2); // Return formatted to 2 decimal places
    }
    return 0;
  }, [chartData]);
  return (
    <div className="h-full w-full row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          // width={730}
          // width={100}
          // height={100}
          data={chartData}
          // margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
          {/* <XAxis dataKey="timestamp2" className="text-xs" axisLine={false} /> */}
          <Legend
            verticalAlign="top"
            content={() => (
              <div className="flex justify-between">
                <span className="text-xs"></span>
                <p className="text-2xl font-bold">
                  ETH ${" "}
                  {chartData
                    ? new BigNumber(chartData?.at(-1)?.avgEthPrice)?.toFormat(2)
                    : "0"}{" "}
                  <span
                    className={cn(
                      "text-xs",
                      Number(diffPercent) > 0 ? "text-success" : "",
                      Number(diffPercent) < 0 ? "text-error" : "",
                      Number(diffPercent) == 0 ? "text-current opacity-80" : "",
                      isNaN(Number(diffPercent))
                        ? "text-current opacity-80"
                        : ""
                    )}
                  >
                    {isNaN(Number(diffPercent)) ? 0 : diffPercent}%
                  </span>
                </p>
              </div>
            )}
          />
          <YAxis className="text-xs" axisLine={false} />
          <XAxis dataKey={"timestamp2"} className="text-xs" axisLine={false} />
          <Tooltip
            content={CustomTooltipRaw}
            cursor={{
              fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))",
              opacity: 0.1,
            }}
          />
          <Area
            type="monotone"
            dataKey="avgEthPrice"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUvAccStatCard)"
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
        className={` bg-base-200 w-[15em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">
            ETH Price :{" "}
            {`$${new BigNumber(payload[0]?.payload?.avgEthPrice)?.toFormat(2)}`}{" "}
          </p>
          <p className="  ">
            Timestamp: {`${payload[0]?.payload?.timestamp2}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
