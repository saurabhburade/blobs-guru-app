"use client";
import ChartLoading from "@/components/Skeletons/ChartLoading";
import {
  BLOB_DAY_DATAS_QUERY,
  BLOB_HOUR_DATAS_QUERY,
} from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { formatBytes, formatEthereumValue } from "@/lib/utils";
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
  AreaChart,
  Area,
  ReferenceArea,
} from "recharts";

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
export default function BlobOnlyEthFeeChart({
  duration,
}: {
  duration: number;
}) {
  const { data, loading } = useQuery(BLOB_HOUR_DATAS_QUERY, {
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
          totalBlobGasEth: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toNumber(),
          totalBlobGasEthF: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toFormat(5),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.blobsHourDatas]);
  const cumulativeData = useMemo(() => {
    const datas = data?.blobsHourDatas
      ?.map((bd: any) => {
        return {
          ...bd,

          totalBlobGas: Number(bd?.totalBlobGas),

          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),

          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobGasEth: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toNumber(),
          totalBlobGasEthFormat: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toFormat(5),
          totalBlobGasUSDFormat: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(5),
          totalBlobGasUSD: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toNumber(),
          totalFeeEth: new BigNumber(Number(bd?.totalFeeEth))
            .div(1e18)
            .toNumber(),
          costPerKiB: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e19)
            .div(Number(bd?.totalBlobGas))
            .multipliedBy(1024)
            .toFormat(5),
          costPerBlob: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .div(Number(bd?.totalBlobHashesCount))
            .toNumber(),
        };
      })
      ?.reverse();
    const totalBlobHashesCount = _.sumBy(datas, "totalBlobHashesCount");
    const totalBlobGasEth = _.sumBy(datas, "totalBlobGasEth");
    const totalBlobGasUSD = _.sumBy(datas, "totalBlobGasUSD");
    const totalFeeEth = _.sumBy(datas, "totalFeeEth");
    const costPerBlob = _.meanBy(datas, "costPerBlob");

    const totalBlobTransactionCount = _.sumBy(
      datas,
      "totalBlobTransactionCount"
    );
    const sizeValue = _.sumBy(datas, "sizeValue");
    const size = _.sumBy(datas, "totalBlobGas");
    return {
      totalBlobHashesCount: new BigNumber(totalBlobHashesCount).toFormat(),
      totalBlobGasUSD: new BigNumber(totalBlobGasUSD).toFormat(),
      totalBlobGasEth: new BigNumber(totalBlobGasEth).toFormat(4),
      totalFeeEth: new BigNumber(totalFeeEth).toFormat(4),
      costPerBlob: new BigNumber(costPerBlob).toFormat(4),
      totalBlobTransactionCount: new BigNumber(
        totalBlobTransactionCount
      ).toFormat(),

      sizeValue,
      size: formatBytes(size),
    };
  }, [data?.blobsHourDatas]);
  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="h-full w-full row-span-2 ">
      <div className="flex justify-between">
        <p className="text-xs"> Cost per blob </p>
        <p className="text-xs">
          {cumulativeData?.costPerBlob} USD [{duration} hours]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={400} height={400} data={chartData}>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />

          <Area
            type="monotone"
            dataKey="costPerBlob"
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
            Blobs cost: ${`${payload[0]?.payload?.costPerBlobF} `}{" "}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
