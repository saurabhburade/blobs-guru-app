"use client";
import { BLOB_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
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
export default function BlobTxnsChart({ duration }: { duration: number }) {
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
          sizeValue: Number(bd?.totalBlobGas),
          Size: formatBytes(Number(bd?.totalBlobGas)),
          timestamp: new Date(Number(bd?.dayStartTimestamp) * 1000),
          timestamp2: formatDateDDMM(
            new Date(Number(bd?.dayStartTimestamp) * 1000)
          ),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobsDayDatas]);
  return (
    <div className="h-full w-full row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={400} height={400} data={chartData}>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />

          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs">Last {duration} days Blob txns</span>
            )}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="30%" stopColor="#8884d8" stopOpacity={1} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Bar
            dataKey="totalBlobTransactionCount"
            fill="url(#colorUv)"
            radius={10}
            // @ts-ignore
            // shape={<TriangleBar />}
          />
          <XAxis
            dataKey="timestamp2"
            className="text-[10px] !text-current"
            angle={0}
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
        className={` bg-base-200 w-1/2 rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">
            Transactions: {`${payload[0]?.payload?.totalBlobTransactionCount}`}
          </p>
          <p className="  ">Timestamp: {`${payload[0]?.payload?.timestamp}`}</p>
        </div>
      </div>
    );
  }

  return null;
};
