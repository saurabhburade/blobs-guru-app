"use client";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_EXPLORER_QUERY_BLOCKS_PAGE,
  BLOB_DAY_DATAS_QUERY,
} from "@/lib/apollo/queries";
import { formatBytes } from "@/lib/utils";
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
export default function RecentBlocksChart({ duration }: { duration: number }) {
  const { data } = useQuery(BLOB_BLOCKS_EXPLORER_QUERY_BLOCKS_PAGE, {
    variables: {
      limit: duration,
      skip: 0,
    },
  });
  // totalBlobTransactionCount;
  // dayStartTimestamp;
  // totalBlobGas;
  // totalBlobAccounts;
  // totalBlobHashesCount;
  const chartData = useMemo(() => {
    const datas = data?.blobBlockDatas
      ?.map((bd: any) => {
        return {
          ...bd,
          sizeValue: Number(bd?.totalBlobGas),
          sizeValueEth: new BigNumber(Number(bd?.totalFeeEth))
            .div(1e18)
            .toFormat(8),
          Size: formatBytes(Number(bd?.totalBlobGas)),
          timestamp: new Date(Number(bd?.timestamp) * 1000),
          timestamp2: new Date(Number(bd?.timestamp) * 1000).toDateString(),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobBlocks: Number(bd?.totalBlobBlocks),
          blockNumberFormated: new BigNumber(
            Number(bd?.blockNumber)
          ).toFormat(),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobBlockDatas]);
  return (
    <div className="h-full w-full row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={400} height={400} data={chartData}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="30%" stopColor="#8884d8" stopOpacity={1} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.9))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />
          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs ">
                Last {duration} Blob containing blocks
              </span>
            )}
          />
          <Bar
            dataKey="sizeValue"
            radius={10}
            // @ts-ignore
            height={10}
            fill="url(#colorUv)"
          />
          <XAxis
            dataKey="blockNumberFormated"
            className="text-[10px] !text-current"
            angle={0}
            allowDataOverflow
            // axisLine={false}
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
        className={` bg-base-200 w-[15em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">Blob Size : {`${payload[0]?.payload?.Size}`}</p>
          <p className="  ">
            Block: {`${payload[0]?.payload?.blockNumberFormated}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
