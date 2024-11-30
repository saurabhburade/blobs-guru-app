"use client";
import { BLOB_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { dateTimeString, formatBytes, formatEthereumValue } from "@/lib/utils";
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
  ReferenceArea,
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
export default function BlobOnlyEthFeeChart({
  duration,
}: {
  duration: number;
}) {
  const { data } = useQuery(BLOB_DAY_DATAS_QUERY, {
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
          timestamp: dateTimeString.format(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          timestamp2: formatDateDDMM(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobGasEth: Number(bd?.totalBlobGasEth),
          totalBlobGasUSD: Number(bd?.totalBlobGasUSD),
          totalBlobGasUSDF: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(2),
          costPerKiB: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e19)
            .div(Number(bd?.totalBlobGas))
            .multipliedBy(1024),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobsDayDatas]);
  return (
    <div className="h-full w-full row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={400} height={400} data={chartData}>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />
          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs">Last {duration} days Blobs fee</span>
            )}
          />
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
          <Area
            type="monotone"
            dataKey="totalBlobGasEth"
            stroke="#8884d8"
            fillOpacity={1}
            strokeWidth={2}
            fill="url(#colorUvAccStatCard)"
          ></Area>

          <XAxis
            dataKey="timestamp2"
            className="text-[10px] !text-current"
            angle={0}
            allowDataOverflow
            axisLine={false}
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
          {/* <p className=" break-words ">
            Transactions : {`${payload[0]?.payload?.totalBlobTransactionCount}`}
          </p> */}
          <p className=" ">
            Fee ETH:{" "}
            {`${formatEthereumValue(Number(payload[0]?.payload?.totalBlobGasEth))}`}{" "}
          </p>
          <p className=" ">
            Fee USD: ${`${payload[0]?.payload?.totalBlobGasUSDF}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
