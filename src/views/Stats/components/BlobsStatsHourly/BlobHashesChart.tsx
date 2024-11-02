"use client";
import {
  BLOB_DAY_DATAS_QUERY,
  BLOB_HOUR_DATAS_QUERY,
} from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
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
const dateFormater = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});
const dayFormater = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});
export default function BlobHashesChart({ duration }: { duration: number }) {
  const { data } = useQuery(BLOB_HOUR_DATAS_QUERY, {
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
    const datas = data?.blobsHourDatas
      ?.map((bd: any) => {
        return {
          ...bd,
          sizeValue: Number(bd?.totalBlobGas),
          sizeValueEth: new BigNumber(Number(bd?.totalFeeEth))
            .div(1e18)
            .toFormat(8),
          Size: formatBytes(Number(bd?.totalBlobGas)),
          timestamp: dateFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          timestamp2: dayFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),

          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobGasEth: Number(bd?.totalBlobGasEth),
          totalBlobGasUSD: Number(bd?.totalBlobGasUSD),
          totalBlobGasUSDF: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(2),
          costPerKiB: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .div(Number(bd?.totalBlobGas))
            .multipliedBy(1024),
          costPerBlob: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .div(Number(bd?.totalBlobHashesCount))
            .toNumber(),
          costPerBlobF: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .div(Number(bd?.totalBlobHashesCount))
            .toFormat(2),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobsHourDatas]);
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
              <span className="text-xs">Last {duration} hours Blob hash</span>
            )}
          />
          <Bar
            dataKey="totalBlobHashesCount"
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
        className={` bg-base-200 w-[15em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">
            Blob Hash :{" "}
            {`${new BigNumber(payload[0]?.payload?.totalBlobHashesCount).toFormat(0)}`}
          </p>
          <p className="  ">Timestamp: {`${payload[0]?.payload?.timestamp}`}</p>
        </div>
      </div>
    );
  }

  return null;
};
