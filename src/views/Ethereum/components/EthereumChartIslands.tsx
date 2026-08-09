"use client";

import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AppChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type AppChartPoint = {
  label: string;
  fullLabel: string;
  total: number;
  values: Record<string, number>;
};

export type PriceChartPoint = {
  label: string;
  fullLabel: string;
  avgNativePrice: number;
  totalDataSubmissionCount: number;
  totalBlobGasUSD: number;
  totalByteSize: number;
};

export type AccountChartPoint = {
  label: string;
  fullLabel: string;
  totalDataSubmissionCount: number;
  totalTxnCount: number;
  totalByteSize: number;
  totalFees: number;
};

type ValueFormat = "bytes" | "eth" | "number";

function formatBytes(value: number, precision = 2) {
  let current = Number(value || 0);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (Math.abs(current) >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toLocaleString("en-US", { maximumFractionDigits: precision })} ${units[unit]}`;
}

function formatNumber(value: number, digits = 0) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatValue(value: number, format: ValueFormat) {
  if (format === "bytes") return formatBytes(value);
  if (format === "eth") return `${formatNumber(value / 10 ** 18, 4)} ETH`;
  return formatNumber(value);
}

function formatSeriesLabel(label: string | undefined) {
  const value = String(label || "");
  return /^(?:0x|\\x)[0-9a-f]{40}$/i.test(value)
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : value;
}

function AppChartTooltip({
  active,
  payload,
  point,
  format,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    fill?: string;
    name?: string;
    value?: number;
    payload?: AppChartPoint & Record<string, number>;
  }>;
  point?: AppChartPoint;
  format: ValueFormat;
}) {
  if (!active || !payload?.length) return null;
  const data = point || payload[0]?.payload;
  const rows = payload
    .filter((item) => Number(item.value || 0) > 0)
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
  return (
    <div className="h-fit max-w-[calc(100vw-2rem)] space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs shadow lg:w-[20em]">
      <div className="flex w-full gap-2 px-4">
        <p className="flex w-full justify-start">{data?.fullLabel}</p>
        <p className="flex w-full justify-end">
          {formatValue(Number(data?.total || 0), format)}
        </p>
      </div>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        {rows.map((item) => (
          <div className="flex min-w-0 items-center gap-2" key={item.dataKey}>
            <span
              className="h-[10px] w-[10px] shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <p className="min-w-0 break-words" title={item.name}>
              {formatSeriesLabel(item.name)}:{" "}
              {formatValue(Number(item.value || 0), format)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StackedAppBarChart({
  title,
  duration,
  points,
  series,
  format,
}: {
  title: string;
  duration: number;
  points: AppChartPoint[];
  series: AppChartSeries[];
  format: ValueFormat;
}) {
  const data = useMemo(
    () => points.map((point) => ({ ...point, ...point.values })),
    [points],
  );
  const cumulative = points.reduce((sum, point) => sum + point.total, 0);
  return (
    <div className="h-full w-full row-span-2">
      <div className="flex justify-between">
        <p className="text-xs">{title} </p>
        <p className="text-xs">
          {formatValue(cumulative, format)} [{duration} days]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
        >
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            content={<AppChartTooltip format={format} />}
          />
          {[...series].reverse().map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              stackId="a"
              radius={[0, 0, 0, 0]}
            />
          ))}
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatValue(Number(value), format)}
          />
          <XAxis
            dataKey="label"
            className="text-[10px] !text-current"
            angle={-60}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
            tickMargin={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PriceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: PriceChartPoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs shadow lg:w-[20em]">
      <p className="px-4">{point.fullLabel}</p>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        <p>ETH Price : ${formatNumber(point.avgNativePrice, 2)}</p>
        <p>Subs Count : {formatNumber(point.totalDataSubmissionCount)}</p>
        <p>Data Size : {formatBytes(point.totalByteSize)}</p>
        <p>DA Fee : ${formatNumber(point.totalBlobGasUSD, 4)}</p>
      </div>
    </div>
  );
}

export function PriceDayChart({ points }: { points: PriceChartPoint[] }) {
  const latest = points.at(-1);
  const previous = points.at(-2);
  const difference =
    latest && previous?.avgNativePrice
      ? ((latest.avgNativePrice - previous.avgNativePrice) /
          previous.avgNativePrice) *
        100
      : 0;
  return (
    <div className="flex h-[20em] w-full flex-col justify-between">
      <div className="flex flex-wrap gap-4 border-b border-base-200 pb-4 lg:flex-nowrap lg:justify-between lg:gap-2">
        <Headline color="#8884d8" label="ETH Price [Today]">
          <span className="font-normal">$</span>{" "}
          {formatNumber(latest?.avgNativePrice || 0, 2)}{" "}
          <span
            className={`text-xs ${difference > 0 ? "text-success" : difference < 0 ? "text-error" : "opacity-80"}`}
          >
            {Number.isFinite(difference) ? difference.toFixed(2) : "0"}%
          </span>
        </Headline>
        <Headline color="currentColor" label="Subs Count">
          {formatNumber(latest?.totalDataSubmissionCount || 0)}
        </Headline>
        <Headline color="orange" label="DA Fees">
          <span className="font-normal">$</span>{" "}
          {formatNumber(latest?.totalBlobGasUSD || 0, 4)}
        </Headline>
        <Headline label="Data Size">
          {formatBytes(latest?.totalByteSize || 0)}
        </Headline>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 30, right: 5, left: 0, bottom: 10 }}
        >
          <XAxis
            dataKey="label"
            className="text-[10px] !text-current"
            angle={-45}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
            tickMargin={10}
          />
          <Tooltip
            content={<PriceTooltip />}
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
            dataKey="avgNativePrice"
            stroke="#8884d8"
            fill="none"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Headline({
  color,
  label,
  children,
}: {
  color?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex w-full items-center gap-2 text-sm leading-none">
        {color ? (
          <span className="h-[10px] w-[10px]" style={{ background: color }} />
        ) : null}
        <p className="opacity-80">{label}</p>
      </div>
      <p className="font-bold leading-6">{children}</p>
    </div>
  );
}

function MetricTooltip({
  active,
  payload,
  title,
  format,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: AccountChartPoint }>;
  title: string;
  format: "bytes" | "fees" | "number";
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const value = Number(payload?.[0]?.value || 0);
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs shadow lg:w-[20em]">
      <p className="px-4">{point.fullLabel}</p>
      <hr className="border-base-200" />
      <p className="px-4">
        {title}:{" "}
        {format === "bytes"
          ? formatBytes(value)
          : format === "fees"
            ? `${formatNumber(value, 4)} ETH`
            : formatNumber(value)}
      </p>
    </div>
  );
}

function SingleMetricChart({
  title,
  duration,
  points,
  dataKey,
  format,
}: {
  title: string;
  duration: number;
  points: AccountChartPoint[];
  dataKey: keyof AccountChartPoint;
  format: "bytes" | "fees" | "number";
}) {
  const total = points.reduce(
    (sum, point) => sum + Number(point[dataKey] || 0),
    0,
  );
  const totalLabel =
    format === "bytes"
      ? formatBytes(total)
      : format === "fees"
        ? `${formatNumber(total, 4)} ETH`
        : formatNumber(total);
  return (
    <div className="h-full w-full row-span-2">
      <div className="flex justify-between">
        <p className="text-xs">{title} </p>
        <p className="text-xs">
          {totalLabel} [{duration} days]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 30, right: 30, left: -20, bottom: 30 }}
        >
          <defs>
            <linearGradient
              id={`ethereum-${String(dataKey)}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            content={<MetricTooltip title={title} format={format} />}
          />
          <Bar
            dataKey={dataKey}
            fill={`url(#ethereum-${String(dataKey)})`}
            radius={10}
          />
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              format === "bytes"
                ? formatBytes(Number(value), 0)
                : formatNumber(Number(value), format === "fees" ? 4 : 0)
            }
          />
          <XAxis
            dataKey="label"
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

export function AccountStatsCharts({
  points,
}: {
  points: AccountChartPoint[];
}) {
  const [duration, setDuration] = useState(15);
  const selected = points.slice(-duration);
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="flex flex-wrap justify-between gap-4 border-b border-base-200 p-5">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/images/ethereum_logo.png"
            width={24}
            height={24}
            alt="ethereum"
            className="rounded-lg"
          />
          <p>DA Stats</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((value) => (
            <button
              type="button"
              className="btn btn-sm"
              key={value}
              onClick={() => setDuration(value)}
            >
              {value}d
            </button>
          ))}
        </div>
      </div>
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <SingleMetricChart
            title="DA Subs"
            duration={duration}
            points={selected}
            dataKey="totalDataSubmissionCount"
            format="number"
          />
        </div>
        <div className="h-[20em] p-5">
          <SingleMetricChart
            title="Transactions"
            duration={duration}
            points={selected}
            dataKey="totalTxnCount"
            format="number"
          />
        </div>
      </div>
      <div className="grid border-t border-base-200 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <SingleMetricChart
            title="Byte Size"
            duration={duration}
            points={selected}
            dataKey="totalByteSize"
            format="bytes"
          />
        </div>
        <div className="h-[20em] p-5">
          <SingleMetricChart
            title="Transaction Fee"
            duration={duration}
            points={selected}
            dataKey="totalFees"
            format="fees"
          />
        </div>
      </div>
    </div>
  );
}

export function EthereumUtilizationGauge({
  blockHeight,
  utilizationPercent,
  averageSize,
  averageBlobCount,
  maxSize,
}: {
  blockHeight: number;
  utilizationPercent: number;
  averageSize: number;
  averageBlobCount: number;
  maxSize: number;
}) {
  const option = {
    series: [
      {
        type: "gauge",
        center: ["50%", "70%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: maxSize / 1024,
        splitNumber: 4,
        itemStyle: { color: "#FFAB91" },
        progress: { show: true, width: 30 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 30 } },
        axisTick: {
          distance: -45,
          splitNumber: 5,
          lineStyle: { width: 2, color: "#999" },
        },
        splitLine: {
          distance: -52,
          length: 14,
          lineStyle: { width: 3, color: "#999" },
        },
        axisLabel: { distance: -20, color: "#999", fontSize: 14 },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          width: "60%",
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, "-15%"],
          fontSize: 20,
          fontWeight: "bolder",
          formatter: "{value} KiB",
          color: "inherit",
        },
        data: [{ value: Number((averageSize / 1024).toFixed(2)) }],
      },
    ],
  };
  return (
    <div className="grid h-full w-full lg:h-[17em] lg:grid-cols-2">
      <div className="h-[17em] w-full p-5">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
      <div className="grid h-[15em] grid-cols-2 border-t border-base-200 lg:h-full lg:border-t-0">
        <GaugeCell label="Block Height" value={formatNumber(blockHeight)} />
        <GaugeCell
          label="Space Utilization"
          value={`${formatNumber(utilizationPercent, 2)}%`}
        />
        <GaugeCell label="Avg. Size/Block" value={formatBytes(averageSize)} />
        <GaugeCell
          label="Avg. DA Tx/Block"
          value={formatNumber(averageBlobCount, 2)}
        />
      </div>
    </div>
  );
}

function GaugeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-b border-base-200 first:border-l-0 lg:border-l">
      <p className="opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
