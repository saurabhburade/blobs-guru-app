"use client";
import ChartLoading from "@/components/Skeletons/ChartLoading";
import {
  BLOB_DAY_DATAS_QUERY,
  ETH_PRICE_DAY_DATAS_QUERY,
} from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { cn, formatBytes, getRandomNumber } from "@/lib/utils";
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
const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export default function ETHPriceDayChart({ duration }: { duration: number }) {
  const { data, loading } = useQuery(ETH_PRICE_DAY_DATAS_QUERY, {
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
          timestamp: dateString.format(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          timestamp2: formatDateDDMM(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount) / 10,
          avgEthPrice: Number(bd?.avgEthPrice),
          totalBlobGasUSD: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e20)
            .toNumber(),
          totalBlobGasUSDF: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(2),
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

  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="w-full h-full h-[25em] lg:h-[18em]  flex justify-between flex-col">
      <div className="grid grid-cols-2 h-[10em] lg:h-[5em] lg:gap-2 gap-4 lg:grid-cols-[1fr_0.5fr_0.5fr_0.5fr] pb-4 border-b border-base-200">
        <div className="">
          <div className=" ">
            <div className=" w-full h-full font-bold leading-6">
              <p className=" w-[10px] h-[10px] bg-[#8884d8]"></p>
              ETH Price [Today]
            </div>
            <div>
              <p className=" leading-6 font-bold">
                <span className="font-normal">$</span>{" "}
                {chartData
                  ? new BigNumber(chartData?.at(-1)?.avgEthPrice)?.toFormat(2)
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
            <div className=" w-full h-full font-bold leading-6">
              <p className=" w-[10px] h-[10px] bg-current"></p>
              Blobs Count
            </div>

            <div>
              <p className=" leading-6 font-bold">
                {chartData
                  ? new BigNumber(
                      chartData?.at(-1)?.totalBlobHashesCount * 10
                    )?.toFormat()
                  : "0"}{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="">
          <div className=" ">
            <div className=" w-full h-full font-bold leading-6">
              <p className=" w-[10px] h-[10px] bg-transparent"></p>
              Data Size
            </div>

            <div>
              <p className=" leading-6 font-bold">
                {chartData ? chartData?.at(-1)?.Size : "0"}{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="">
          <div className=" ">
            <div className=" w-full h-full font-bold leading-6">
              <p className=" w-[10px] h-[10px] bg-[orange]"></p>
              Blob Fees
            </div>

            <div>
              <p className=" leading-6 font-bold">
                <span className="font-normal">$</span>{" "}
                {chartData ? chartData?.at(-1)?.totalBlobGasUSDF : "0"}{" "}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          // width={730}
          // width={100}
          // height={100}
          data={chartData}
          // margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          margin={{ top: 30, right: -25, left: 0, bottom: 10 }}
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
          {/* <Legend
            verticalAlign="top"
            content={() => (
            
            )}
          /> */}
          {/* <YAxis
            className="text-[10px] "
            axisLine={false}
            tickLine={false}
            orientation={"right"}
          /> */}
          <XAxis
            dataKey={"timestamp2"}
            className="text-[10px] !text-current"
            angle={45}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
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
            dataKey="totalBlobHashesCount"
            stroke="currentColor"
            fill="none"
            strokeWidth={2}
            // TODO: make it generic & reusable
            strokeDasharray={`${duration * 11} 2 5 2 5 2 5 2 5   2 5 2 5 2 5 2 5`}
          />
          <Area
            type="monotone"
            dataKey="totalBlobGasUSD"
            stroke="orange"
            fill="none"
            strokeWidth={2}
            // TODO: make it generic & reusable
            strokeDasharray={`${duration * 11} 2 5 2 5 2 5 2 5   2 5 2 5 2 5 2 5`}
          />
          <Area
            type="monotone"
            dataKey="avgEthPrice"
            stroke="#8884d8"
            fillOpacity={1}
            strokeWidth={2}
            // fill="url(#colorUvAccStatCard)"
            fill="none"
            // TODO: make it generic & reusable
            strokeDasharray={`${duration * 11} 2 5 2 5 2 5 2 5   2 5 2 5 2 5 2 5`}
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
            ETH Price :{" "}
            {`$${new BigNumber(payload[0]?.payload?.avgEthPrice)?.toFormat(2)}`}{" "}
          </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">
            Blobs Count :{" "}
            {`${new BigNumber(payload[0]?.payload?.totalBlobHashesCount)?.multipliedBy(10)?.toFormat()}`}{" "}
          </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">Data Size : {`${payload[0]?.payload?.Size}`} </p>
        </div>
        <div className="px-4 space-y-3">
          <p className=" ">
            Blob Fee : ${`${payload[0]?.payload?.totalBlobGasUSDF}`}{" "}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
