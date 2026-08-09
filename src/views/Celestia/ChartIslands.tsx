"use client";

import ReactECharts from "echarts-for-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Numeric = number | string | null | undefined;

export type CelestiaParticipantChartDatum = {
  appId?: string | null;
  appName?: string | null;
  app?: { name?: string | null } | null;
  totalByteSize?: Numeric;
  totalTxnCount?: Numeric;
  totalDataSubmissionCount?: Numeric;
  totalDAFees?: Numeric;
  totalDAFeesUSD?: Numeric;
};

export type CelestiaDayChartDatum = {
  id?: string | null;
  timestampStart?: string | null;
  timestampLast?: string | null;
  totalByteSize?: Numeric;
  totalTxnCount?: Numeric;
  totalDataSubmissionCount?: Numeric;
  totalDAFees?: Numeric;
  totalDAFeesUSD?: Numeric;
  avgNativePrice?: Numeric;
  participants?: CelestiaParticipantChartDatum[] | null;
  appDayDataParticipant?: {
    nodes?: CelestiaParticipantChartDatum[] | null;
  } | null;
  other?: CelestiaParticipantChartDatum | null;
  appDayDataParticipantOthers?: {
    aggregates?: { sum?: CelestiaParticipantChartDatum | null } | null;
  } | null;
};

export type CelestiaEntityDayChartDatum = {
  timestampStart?: string | null;
  timestampLast?: string | null;
  totalByteSize?: Numeric;
  totalTxnCount?: Numeric;
  totalDataSubmissionCount?: Numeric;
  totalFees?: Numeric;
  totalFeesNative?: Numeric;
};

export type CelestiaBlockChartDatum = {
  id?: Numeric;
  totalBlobSize?: Numeric;
  totalBlobTransactionCount?: Numeric;
};

const shortDate = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
});

const fullDate = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

function numeric(value: Numeric) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(day: {
  timestampStart?: string | null;
  timestampLast?: string | null;
}) {
  return day.timestampStart || day.timestampLast || "";
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : shortDate.format(date);
}

function formatFullDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : fullDate.format(date);
}

function formatBytes(value: Numeric, precision = 2) {
  const bytes = numeric(value);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const index = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    units.length - 1,
  );
  const scaled = bytes / 1024 ** index;
  return `${scaled.toFixed(index === 0 ? 0 : precision)} ${units[index]}`;
}

function formatNumber(value: Numeric, maximumFractionDigits = 2) {
  return numeric(value).toLocaleString("en-US", { maximumFractionDigits });
}

function participantName(participant: CelestiaParticipantChartDatum) {
  return (
    participant.appName || participant.app?.name || participant.appId || "Other"
  );
}

function participants(day: CelestiaDayChartDatum, includeOther: boolean) {
  const rows = day.participants || day.appDayDataParticipant?.nodes || [];
  if (!includeOther) return rows;
  const other =
    day.other || day.appDayDataParticipantOthers?.aggregates?.sum || null;
  return other ? [{ ...other, appId: "Other" }, ...rows] : rows;
}

function getColorForIndex(index: number, totalColors: number) {
  if (index === 0) return "#3360cc";
  const goldenRatioConjugate = 0.718033;
  const hue = (index / Math.max(totalColors, 1) + goldenRatioConjugate) % 1;
  const saturation = 60 + (index % 40);
  const lightness = 50 + ((index * 7) % 25);
  return hslToHex(hue * 360, saturation, lightness);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;
  if (hue < 60) [red, green] = [chroma, x];
  else if (hue < 120) [red, green] = [x, chroma];
  else if (hue < 180) [green, blue] = [chroma, x];
  else if (hue < 240) [green, blue] = [x, chroma];
  else if (hue < 300) [red, blue] = [x, chroma];
  else [red, blue] = [chroma, x];
  return `#${[red, green, blue]
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function wrapName(value: string, start = 5, end = 5) {
  return value.length > start + end
    ? `${value.slice(0, start)}...${value.slice(-end)}`
    : value;
}

type StackMetric =
  | "totalByteSize"
  | "totalTxnCount"
  | "totalDataSubmissionCount"
  | "totalDAFees";

function makeStackedData(
  days: CelestiaDayChartDatum[],
  metric: StackMetric,
  includeOther: boolean,
) {
  const chronological = days.slice().reverse();
  const keySet = new Set<string>();
  const data = chronological.map((day) => {
    const timestamp = dateValue(day);
    const result: Record<string, string | number> = {
      timestamp: formatFullDate(timestamp),
      timestampShort: formatShortDate(timestamp),
      timestampRaw: timestamp,
    };
    participants(day, includeOther).forEach((participant) => {
      const key = participantName(participant);
      keySet.add(key);
      result[key] = numeric(participant[metric]);
    });
    return result;
  });
  return { data, keys: Array.from(keySet) };
}

function StackedBarChart({
  days,
  duration,
  metric,
  title,
  includeOther = true,
  headerValue,
  valueKind = "number",
}: {
  days: CelestiaDayChartDatum[];
  duration: number;
  metric: StackMetric;
  title: string;
  includeOther?: boolean;
  headerValue: string;
  valueKind?: "number" | "bytes" | "tia";
}) {
  const chart = makeStackedData(days, metric, includeOther);
  const keys = includeOther ? chart.keys.slice().reverse() : chart.keys;
  return (
    <div className="row-span-2 h-full w-full">
      <div className="flex justify-between">
        <p className="text-xs">{title}</p>
        <p className="text-xs">
          {headerValue} [{duration} days]
        </p>
      </div>
      <div className="h-[calc(100%-1rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chart.data}
            margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
          >
            <Tooltip
              cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
              content={<StackTooltip valueKind={valueKind} />}
            />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getColorForIndex(index, keys.length)}
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
            ))}
            <YAxis
              className="text-[10px] !text-current"
              allowDataOverflow
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                valueKind === "bytes" ? formatBytes(value, 1) : String(value)
              }
            />
            <XAxis
              dataKey="timestampShort"
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
    </div>
  );
}

function StackTooltip({ active, payload, valueKind }: any) {
  if (!active || !payload?.length) return null;
  const sorted = payload
    .filter((item: any) => numeric(item.value) !== 0)
    .slice()
    .sort(
      (left: any, right: any) => numeric(right.value) - numeric(left.value),
    );
  const total = sorted.reduce(
    (sum: number, item: any) => sum + numeric(item.value),
    0,
  );
  const format = (value: Numeric) => {
    if (valueKind === "bytes") return formatBytes(value);
    if (valueKind === "tia") return `${formatNumber(value, 2)} TIA`;
    return formatNumber(value, 2);
  };
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <div className="flex w-full justify-between gap-2 px-4">
        <p>{payload[0]?.payload?.timestamp}</p>
        <p>{format(total)}</p>
      </div>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        {sorted.map((item: any) => (
          <div className="flex items-center gap-2" key={item.dataKey}>
            <span
              className="h-[10px] w-[10px]"
              style={{ backgroundColor: item.fill }}
            />
            <p>
              {wrapName(String(item.name))} : {format(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CelestiaSummaryByteSizeChart({
  days,
  duration = 30,
}: {
  days: CelestiaDayChartDatum[];
  duration?: number;
}) {
  const total = days.reduce((sum, day) => sum + numeric(day.totalByteSize), 0);
  return (
    <StackedBarChart
      days={days}
      duration={duration}
      metric="totalByteSize"
      title="Byte Size"
      includeOther={false}
      headerValue={formatBytes(total)}
      valueKind="bytes"
    />
  );
}

export function CelestiaPriceChart({
  days,
}: {
  days: CelestiaDayChartDatum[];
}) {
  const data = days
    .slice()
    .reverse()
    .map((day) => {
      const timestamp = dateValue(day);
      return {
        timestamp: formatFullDate(timestamp),
        timestampShort: formatShortDate(timestamp),
        avgNativePrice: numeric(day.avgNativePrice),
        totalDataSubmissionCount: numeric(day.totalDataSubmissionCount),
        totalBlobGasUSD: numeric(day.totalDAFeesUSD),
        size: formatBytes(day.totalByteSize),
      };
    });
  const latest = data.at(-1);
  const previous = data.at(-2);
  const diff = previous?.avgNativePrice
    ? ((numeric(latest?.avgNativePrice) - previous.avgNativePrice) /
        previous.avgNativePrice) *
      100
    : 0;
  return (
    <div className="flex h-[20em] h-full w-full flex-col justify-between">
      <div className="flex flex-wrap gap-4 border-b border-base-200 pb-4 lg:flex-nowrap lg:justify-between lg:gap-2">
        <PriceMetric color="#8884d8" title="TIA Price [Today]">
          <span className="font-normal">$</span>{" "}
          {formatNumber(latest?.avgNativePrice, 2)}{" "}
          <span
            className={`text-xs ${diff > 0 ? "text-success" : diff < 0 ? "text-error" : "opacity-80"}`}
          >
            {diff.toFixed(2)}%
          </span>
        </PriceMetric>
        <PriceMetric color="currentColor" title="Subs Count">
          {formatNumber(latest?.totalDataSubmissionCount, 0)}
        </PriceMetric>
        <PriceMetric color="orange" title="DA Fees">
          <span className="font-normal">$</span>{" "}
          {formatNumber(latest?.totalBlobGasUSD, 2)}
        </PriceMetric>
        <div>
          <p className="text-sm leading-none opacity-80">Data Size</p>
          <p className="font-bold leading-6">{latest?.size || "0 B"}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 30, right: 5, left: 0, bottom: 10 }}
        >
          <XAxis
            dataKey="timestampShort"
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

function PriceMetric({ color, title, children }: any) {
  return (
    <div>
      <div className="flex h-full w-full items-center gap-2 text-sm leading-none">
        <span
          className="h-[10px] w-[10px]"
          style={{ backgroundColor: color }}
        />
        <p className="opacity-80">{title}</p>
      </div>
      <p className="font-bold leading-6">{children}</p>
    </div>
  );
}

function PriceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{point.timestamp}</p>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        <p>TIA Price : ${formatNumber(point.avgNativePrice, 2)}</p>
        <p>Subs Count : {formatNumber(point.totalDataSubmissionCount, 0)}</p>
        <p>Data Size : {point.size}</p>
        <p>DA Fee : ${formatNumber(point.totalBlobGasUSD, 2)}</p>
      </div>
    </div>
  );
}

export function CelestiaSummaryCharts({
  days,
  prices,
}: {
  days: CelestiaDayChartDatum[];
  prices: CelestiaDayChartDatum[];
}) {
  return (
    <div className="grid gap-4 lg:h-[20em] lg:grid-cols-2">
      <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
        <CelestiaSummaryByteSizeChart days={days} duration={30} />
      </div>
      <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
        <CelestiaPriceChart days={prices} />
      </div>
    </div>
  );
}

export function CelestiaStatsCharts({
  days,
  duration: initialDuration = 15,
}: {
  days: CelestiaDayChartDatum[];
  duration?: number;
}) {
  const [duration, setDuration] = useState(initialDuration);
  const visibleDays = days.slice(0, duration);
  const total = (key: StackMetric) =>
    visibleDays.reduce((sum, day) => sum + numeric(day[key]), 0);
  return (
    <div className="border border-base-200 bg-base-100">
      <div className="flex justify-between border-b border-base-200 p-5">
        <p>Celestia Stats</p>
        <DurationControls duration={duration} onChange={setDuration} />
      </div>
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-r border-base-200 p-5">
          <StackedBarChart
            days={visibleDays}
            duration={duration}
            metric="totalByteSize"
            title="Byte Size"
            headerValue={formatBytes(total("totalByteSize"))}
            valueKind="bytes"
          />
        </div>
        <div className="h-[20em] p-5">
          <StackedBarChart
            days={visibleDays}
            duration={duration}
            metric="totalDataSubmissionCount"
            title="DA Subs"
            headerValue={formatNumber(total("totalDataSubmissionCount"), 0)}
          />
        </div>
      </div>
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-r border-base-200 p-5">
          <StackedBarChart
            days={visibleDays}
            duration={duration}
            metric="totalDAFees"
            title="DA Subs"
            headerValue={`${formatNumber(total("totalDAFees"), 2)} TIA`}
            valueKind="tia"
          />
        </div>
        <div className="h-[20em] p-5">
          <StackedBarChart
            days={visibleDays}
            duration={duration}
            metric="totalTxnCount"
            title="Transactions"
            headerValue={formatNumber(total("totalTxnCount"), 0)}
          />
        </div>
      </div>
    </div>
  );
}

function DurationControls({
  duration,
  onChange,
}: {
  duration: number;
  onChange: (duration: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[7, 30, 90].map((option) => (
        <button
          key={option}
          className="btn btn-sm"
          aria-pressed={duration === option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}d
        </button>
      ))}
    </div>
  );
}

export function CelestiaUtilisationChart({
  blocks,
  limit = 100,
  maxBytes = 1_048_576 * 8,
}: {
  blocks: CelestiaBlockChartDatum[];
  limit?: number;
  maxBytes?: number;
}) {
  const count = blocks.length || 1;
  const totalSize = blocks.reduce(
    (sum, block) => sum + numeric(block.totalBlobSize),
    0,
  );
  const totalTransactions = blocks.reduce(
    (sum, block) => sum + numeric(block.totalBlobTransactionCount),
    0,
  );
  const averageSize = totalSize / count;
  const averageTransactions = totalTransactions / count;
  const utilization = (averageSize / maxBytes) * 100;
  const option = {
    series: [
      {
        type: "gauge",
        center: ["50%", "70%"],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: maxBytes / 1024,
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
    <div className="w-full rounded-lg border border-base-200 p-1">
      <div className="rounded-lg bg-base-100">
        <p className="w-full border-b border-base-200 p-3 text-xs">
          Space Utilization [Last {limit} Blocks]
        </p>
        <div className="grid h-full w-full lg:h-[17em] lg:grid-cols-2">
          <div className="h-[17em] w-full p-5">
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <div className="grid h-[15em] grid-cols-2 border-t border-base-200 lg:h-full lg:border-t-0">
            <UtilMetric title="Block Height" border="lg:border-l border-b">
              {formatNumber(blocks[0]?.id, 0)}
            </UtilMetric>
            <UtilMetric title="Space Utilization" border="border-l border-b">
              {utilization.toFixed(2)}%
            </UtilMetric>
            <UtilMetric title="Avg. Size/Block" border="lg:border-l">
              {formatBytes(averageSize)}
            </UtilMetric>
            <UtilMetric title="Avg. DA Tx/Block" border="border-l">
              {formatNumber(averageTransactions, 2)}
            </UtilMetric>
          </div>
        </div>
      </div>
    </div>
  );
}

function UtilMetric({ title, border, children }: any) {
  return (
    <div
      className={`flex flex-col items-center justify-center border-base-200 ${border}`}
    >
      <p className="opacity-70">{title}</p>
      <p className="text-2xl font-bold">{children}</p>
    </div>
  );
}

type EntityMetric =
  | "totalByteSize"
  | "totalTxnCount"
  | "totalDataSubmissionCount"
  | "totalFeesNative";

export function CelestiaEntityStatsCharts({
  days,
  duration: initialDuration = 15,
  kind = "account",
}: {
  days: CelestiaEntityDayChartDatum[];
  duration?: number;
  kind?: "account" | "app";
}) {
  const [duration, setDuration] = useState(initialDuration);
  const visibleDays = days.slice(0, duration);
  const firstMetric: EntityMetric =
    kind === "app" ? "totalByteSize" : "totalDataSubmissionCount";
  const firstTitle = kind === "app" ? "Byte Size" : "DA Subs";
  const secondMetric: EntityMetric =
    kind === "app" ? "totalDataSubmissionCount" : "totalTxnCount";
  const secondTitle = kind === "app" ? "DA Subs" : "Transactions";
  const thirdMetric: EntityMetric =
    kind === "app" ? "totalTxnCount" : "totalByteSize";
  const thirdTitle = kind === "app" ? "Transactions" : "Byte Size";
  return (
    <div className="border border-base-200 bg-base-100">
      <div className="flex flex-wrap justify-between gap-4 border-b border-base-200 p-5">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/images/celestia_logo.png"
            width="24"
            height="24"
            alt="Celestia"
            className="rounded-lg"
          />
          <p>DA Stats</p>
        </div>
        <DurationControls duration={duration} onChange={setDuration} />
      </div>
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <EntityBarChart
            days={visibleDays}
            duration={duration}
            title={firstTitle}
            metric={firstMetric}
          />
        </div>
        <div className="h-[20em] p-5">
          <EntityBarChart
            days={visibleDays}
            duration={duration}
            title={secondTitle}
            metric={secondMetric}
          />
        </div>
      </div>
      <div className="grid border-t border-base-200 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <EntityBarChart
            days={visibleDays}
            duration={duration}
            title={thirdTitle}
            metric={thirdMetric}
          />
        </div>
        <div className="h-[20em] p-5">
          <EntityBarChart
            days={visibleDays}
            duration={duration}
            title="Transaction Fee"
            metric="totalFeesNative"
          />
        </div>
      </div>
    </div>
  );
}

function EntityBarChart({
  days,
  duration,
  title,
  metric,
}: {
  days: CelestiaEntityDayChartDatum[];
  duration: number;
  title: string;
  metric: EntityMetric;
}) {
  const data = days
    .slice()
    .reverse()
    .map((day) => {
      const timestamp = dateValue(day);
      const value =
        metric === "totalFeesNative"
          ? numeric(day.totalFeesNative ?? day.totalFees)
          : numeric(day[metric]);
      return {
        timestamp: formatFullDate(timestamp),
        timestampShort: formatShortDate(timestamp),
        value,
      };
    });
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const bytesMetric = metric === "totalByteSize";
  const feeMetric = metric === "totalFeesNative";
  const header = bytesMetric
    ? formatBytes(total)
    : feeMetric
      ? `${formatNumber(total, 4)} TIA`
      : formatNumber(total, 0);
  const gradientId = `celestia-${metric}-gradient`;
  return (
    <div className="row-span-2 h-full w-full">
      <div className="flex justify-between">
        <p className="text-xs">{title}</p>
        <p className="text-xs">
          {header} [{duration} days]
        </p>
      </div>
      <div className="h-[calc(100%-1rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
              content={
                <EntityTooltip
                  bytesMetric={bytesMetric}
                  feeMetric={feeMetric}
                />
              }
            />
            <Bar dataKey="value" fill={`url(#${gradientId})`} radius={10} />
            <YAxis
              className="text-[10px] !text-current"
              allowDataOverflow
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                bytesMetric ? formatBytes(value, 1) : String(value)
              }
            />
            <XAxis
              dataKey="timestampShort"
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
    </div>
  );
}

function EntityTooltip({ active, payload, bytesMetric, feeMetric }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const formatted = bytesMetric
    ? formatBytes(point.value)
    : feeMetric
      ? `${formatNumber(point.value, 4)} TIA`
      : formatNumber(point.value, 0);
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{point.timestamp}</p>
      <hr className="border-base-200" />
      <p className="px-4">{formatted}</p>
    </div>
  );
}

export type CelestiaTvlDatum = {
  timestamp: number;
  tvlChart: number;
  nativeChart: number;
  canonicalChart: number;
  externalChart: number;
  canonical?: number;
  native?: number;
  external?: number;
  canonicalPercent?: number;
  nativePercent?: number;
  externalPercent?: number;
};

export function CelestiaTvlChart({ data }: { data: CelestiaTvlDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data.map((item) => ({
          ...item,
          timestampDate: new Date(item.timestamp * 1000).toDateString(),
        }))}
      >
        <Legend
          verticalAlign="top"
          content={() => <span className="text-xs">Chain TVL</span>}
        />
        <XAxis dataKey="timestampDate" className="text-xs" axisLine={false} />
        <Tooltip content={<TvlTooltip />} />
        <Area
          type="monotone"
          dataKey="tvlChart"
          stroke="#8884d8"
          fill="none"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="nativeChart"
          stroke="#be185d"
          fill="#be185d"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="canonicalChart"
          stroke="#7e22ce"
          fill="#7e22ce"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="externalChart"
          stroke="#eab308"
          fill="#eab308"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TvlTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const total =
    numeric(point.canonical) + numeric(point.native) + numeric(point.external);
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[25em]">
      <p className="px-4">{new Date(point.timestamp * 1000).toString()}</p>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        <TvlTooltipRow color="#8884d8" title="TVL" value={total} />
        <hr className="border-base-200" />
        <TvlTooltipRow
          color="#7e22ce"
          title="Canonical"
          value={point.canonical}
        />
        <TvlTooltipRow color="#be185d" title="Native" value={point.native} />
        <TvlTooltipRow
          color="#eab308"
          title="External"
          value={point.external}
        />
      </div>
    </div>
  );
}

function TvlTooltipRow({ color, title, value }: any) {
  return (
    <div className="flex w-full justify-between text-md">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-lg border border-base-300"
          style={{ backgroundColor: color }}
        />
        <p>{title}</p>
      </div>
      <p className="font-bold opacity-70">$ {formatNumber(value, 2)}</p>
    </div>
  );
}

export type CelestiaRiskDatum = {
  name: string;
  valuePie: number;
  value?: string;
  sentiment?: "good" | "bad" | "warning" | "neutral";
  description?: string;
};

export function CelestiaRiskPieChart({ data }: { data: CelestiaRiskDatum[] }) {
  const colors = {
    good: "#4CAF50",
    bad: "#F44336",
    warning: "#FF9800",
    neutral: "gray",
  } as const;
  return (
    <ResponsiveContainer width="100%" height="100%" className="bg-base-100">
      <PieChart width={400} height={400}>
        <Pie
          dataKey="valuePie"
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={0}
          label={renderRiskLabel}
          labelLine={false}
          cornerRadius="100%"
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry.name}-${index}`}
              fill={colors[entry.sentiment || "neutral"]}
              className="stroke-[10px] stroke-base-100"
              strokeLinejoin="round"
            />
          ))}
        </Pie>
        <Tooltip content={<RiskTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderRiskLabel(props: any) {
  const radian = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, fill, payload } = props;
  const sin = Math.sin(-radian * midAngle);
  const cos = Math.cos(-radian * midAngle);
  const startX = cx + (outerRadius + 10) * cos;
  const startY = cy + (outerRadius + 10) * sin;
  const middleX = cx + (outerRadius + 30) * cos;
  const middleY = cy + (outerRadius + 30) * sin;
  const endX = middleX + (cos >= 0 ? 1 : -1) * 22;
  const anchor = cos >= 0 ? "start" : "end";
  return (
    <g>
      <path
        d={`M${startX},${startY}L${middleX},${middleY}L${endX},${middleY}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={endX} cy={middleY} r={2} fill={fill} stroke="none" />
      <text
        x={endX + (cos >= 0 ? 1 : -1) * 12}
        y={middleY}
        dy={6}
        textAnchor={anchor}
        fill="#999"
      >
        {payload.name}
      </text>
    </g>
  );
}

function RiskTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const risk = payload[0]?.payload as CelestiaRiskDatum & { fill?: string };
  return (
    <div className="h-fit w-[25em] space-y-4 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs">
      <div className="flex justify-between gap-2 px-4">
        <p>
          {risk.name} — {risk.value}
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className="h-[1em] w-[1em] rounded-full"
            style={{ backgroundColor: risk.fill }}
          />
          <p className="capitalize">{risk.sentiment}</p>
        </div>
      </div>
      <hr className="border-base-200" />
      <p className="px-4">{risk.description}</p>
    </div>
  );
}
