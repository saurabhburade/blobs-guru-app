"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
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

type Node = Record<string, unknown>;

type AppParticipant = {
  app?: { id?: string | null; name?: string | null } | null;
  totalByteSize?: number | string | null;
  totalDataSubmissionCount?: number | string | null;
  totalFeesAvail?: number | string | null;
};

type AccountParticipant = {
  accountId?: string | null;
  totalExtrinsicCount?: number | string | null;
};

type ChartDatum = Record<string, string | number | null | undefined>;

const shortDate = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

function number(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function dateValue(day: Node): unknown {
  return day.timestampStart ?? day.timestampLast;
}

function dateLabels(day: Node) {
  const raw = dateValue(day);
  const date = new Date(String(raw ?? ""));
  if (Number.isNaN(date.getTime())) {
    const fallback = String(raw ?? "");
    return { short: fallback, long: fallback };
  }
  return {
    short: shortDate.format(date),
    long: longDate.format(date),
  };
}

function formatBytes(value: unknown, digits = 2): string {
  const bytes = number(value);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index ? digits : 0)} ${units[index]}`;
}

function formatNumber(value: unknown, maximumFractionDigits = 2): string {
  return number(value).toLocaleString("en-US", { maximumFractionDigits });
}

function wrap(value: unknown, start = 5, end = 5): string {
  const text = String(value ?? "");
  return text.length > start + end
    ? `${text.slice(0, start)}...${text.slice(-end)}`
    : text;
}

function colorForIndex(index: number, total: number): string {
  if (index === 0) return "#3360cc";
  const hue = (index / Math.max(total, 1) + 0.718033) % 1;
  const saturation = 60 + (index % 40);
  const lightness = 50 + ((index * 7) % 25);
  return `hsl(${hue * 360} ${saturation}% ${lightness}%)`;
}

function appParticipants(day: Node): AppParticipant[] {
  const participant = day.appDayDataParticipant as
    | { nodes?: AppParticipant[] }
    | undefined;
  return participant?.nodes ?? [];
}

function accountParticipants(day: Node): AccountParticipant[] {
  const participant = day.accountDayDataParticipant as
    | { nodes?: AccountParticipant[] }
    | undefined;
  return participant?.nodes ?? [];
}

function appStackData(
  days: Node[],
  field: "totalByteSize" | "totalDataSubmissionCount" | "totalFeesAvail",
) {
  const keys: string[] = [];
  const seen = new Set<string>();
  const rows = days
    .map((day) => {
      const labels = dateLabels(day);
      const row: ChartDatum = {
        timestamp: labels.long,
        timestampShort: labels.short,
      };
      for (const participant of appParticipants(day)) {
        const key = participant.app?.name || participant.app?.id || "Unknown";
        if (!seen.has(key)) {
          seen.add(key);
          keys.push(key);
        }
        row[key] = number(participant[field]);
      }
      return row;
    })
    .reverse();
  return { keys, rows };
}

function accountStackData(days: Node[]) {
  const keys: string[] = [];
  const seen = new Set<string>();
  const rows = days
    .map((day) => {
      const labels = dateLabels(day);
      const row: ChartDatum = {
        timestamp: labels.long,
        timestampShort: labels.short,
      };
      const participants = [...accountParticipants(day)];
      const others = day.accountDayDataParticipantOthers as
        | { aggregates?: { sum?: { totalExtrinsicCount?: unknown } } }
        | undefined;
      const otherCount = number(others?.aggregates?.sum?.totalExtrinsicCount);
      if (otherCount) {
        participants.unshift({
          accountId: "Other",
          totalExtrinsicCount: otherCount,
        });
      }
      for (const participant of participants) {
        const key = participant.accountId || "Unknown";
        if (!seen.has(key)) {
          seen.add(key);
          keys.push(key);
        }
        row[key] = number(participant.totalExtrinsicCount);
      }
      return row;
    })
    .reverse();
  return { keys, rows };
}

type StackTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    fill?: string;
    name?: string;
    value?: number;
    payload?: ChartDatum;
  }>;
  formatValue?: (value: number) => string;
};

function StackTooltip({
  active,
  payload,
  formatValue = formatNumber,
}: StackTooltipProps) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort(
    (left, right) => number(right.value) - number(left.value),
  );
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{String(payload[0]?.payload?.timestamp ?? "")}</p>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        {sorted.map((item) => (
          <div
            className="flex items-center gap-2"
            key={String(item.dataKey ?? item.name)}
          >
            <span
              className="h-[10px] w-[10px]"
              style={{ backgroundColor: item.fill }}
            />
            <p>
              {wrap(item.name ?? item.dataKey)} :{" "}
              {formatValue(number(item.value))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedBarChart({
  days,
  field,
  title,
  duration,
  total,
  totalFormatter = formatNumber,
  valueFormatter = formatNumber,
  byteAxis = false,
  reverseSeries = false,
}: {
  days: Node[];
  field: "totalByteSize" | "totalDataSubmissionCount" | "totalFeesAvail";
  title: string;
  duration: number;
  total: number;
  totalFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  byteAxis?: boolean;
  reverseSeries?: boolean;
}) {
  const { keys, rows } = appStackData(days, field);
  const series = reverseSeries ? [...keys].reverse() : keys;
  return (
    <div className="row-span-2 h-full w-full">
      <div className="flex justify-between">
        <p className="text-xs">{title}</p>
        <p className="text-xs">
          {totalFormatter(total)} [{duration} days]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
        >
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            content={<StackTooltip formatValue={valueFormatter} />}
          />
          {series.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colorForIndex(index, series.length)}
              stackId="a"
              radius={[0, 0, 0, 0]}
            />
          ))}
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            tickFormatter={
              byteAxis ? (value) => formatBytes(value, 0) : undefined
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
  );
}

export function AvailSummarySizeChart({
  days,
  duration = 30,
}: {
  days: Node[];
  duration?: number;
}) {
  const total = days.reduce((sum, day) => sum + number(day.totalByteSize), 0);
  return (
    <StackedBarChart
      days={days}
      field="totalByteSize"
      title="Byte Size"
      duration={duration}
      total={total}
      totalFormatter={formatBytes}
      valueFormatter={formatBytes}
      byteAxis
    />
  );
}

type PriceTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartDatum }>;
};

function PriceTooltip({ active, payload }: PriceTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="h-fit space-y-3 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{point?.timestamp}</p>
      <hr className="border-base-200" />
      <p className="px-4">
        AVAIL Price : ${formatNumber(point?.avgAvailPrice)}
      </p>
      <p className="px-4">
        Subs Count : {formatNumber(point?.totalDataSubmissionCount, 0)}
      </p>
      <p className="px-4">Data Size : {formatBytes(point?.totalByteSize)}</p>
      <p className="px-4">DA Fee : ${formatNumber(point?.totalDAFeesUSD)}</p>
    </div>
  );
}

export function AvailSummaryPriceChart({ days }: { days: Node[] }) {
  const data: ChartDatum[] = days
    .map((day) => {
      const labels = dateLabels(day);
      return {
        timestamp: labels.long,
        timestampShort: labels.short,
        totalByteSize: number(day.totalByteSize),
        totalDataSubmissionCount: number(day.totalDataSubmissionCount),
        totalDAFeesUSD: number(day.totalDAFeesUSD),
        avgAvailPrice: number(day.avgAvailPrice),
      };
    })
    .reverse();
  const today = data.at(-1);
  const previous = data.at(-2);
  const price = number(today?.avgAvailPrice);
  const previousPrice = number(previous?.avgAvailPrice);
  const priceChange = previousPrice
    ? ((price - previousPrice) / previousPrice) * 100
    : 0;
  return (
    <div className="flex h-[20em] h-full w-full flex-col justify-between">
      <div className="flex flex-wrap gap-4 border-b border-base-200 pb-4 lg:flex-nowrap lg:justify-between lg:gap-2">
        <HeaderMetric color="#8884d8" label="AVAIL Price [Today]">
          <span className="font-normal">$</span> {formatNumber(price)}{" "}
          <span
            className={`text-xs ${priceChange > 0 ? "text-success" : priceChange < 0 ? "text-error" : "opacity-80"}`}
          >
            {priceChange.toFixed(2)}%
          </span>
        </HeaderMetric>
        <HeaderMetric color="currentColor" label="Subs Count">
          {formatNumber(today?.totalDataSubmissionCount, 0)}
        </HeaderMetric>
        <HeaderMetric color="orange" label="DA Fees">
          <span className="font-normal">$</span>{" "}
          {formatNumber(today?.totalDAFeesUSD)}
        </HeaderMetric>
        <div>
          <p className="text-sm leading-none opacity-80">Data Size</p>
          <p className="font-bold leading-6">
            {formatBytes(today?.totalByteSize)}
          </p>
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
            dataKey="totalDAFeesUSD"
            stroke="orange"
            fill="none"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="avgAvailPrice"
            stroke="#8884d8"
            fill="none"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function HeaderMetric({
  color,
  label,
  children,
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex h-full w-full items-center gap-2 text-sm leading-none">
        <span
          className="h-[10px] w-[10px]"
          style={{ backgroundColor: color }}
        />
        <p className="opacity-80">{label}</p>
      </div>
      <p className="font-bold leading-6">{children}</p>
    </div>
  );
}

function ExtrinsicStackedChart({
  days,
  duration,
}: {
  days: Node[];
  duration: number;
}) {
  const { keys, rows } = accountStackData(days);
  const total = rows.reduce(
    (sum, row) =>
      sum + keys.reduce((rowSum, key) => rowSum + number(row[key]), 0),
    0,
  );
  return (
    <div className="row-span-2 h-full w-full">
      <div className="flex justify-between">
        <p className="text-xs">Total Ext</p>
        <p className="text-xs">
          {formatNumber(total, 0)} [{duration} days]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
        >
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            content={<StackTooltip />}
          />
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colorForIndex(index, keys.length)}
              stackId="a"
              radius={[0, 0, 0, 0]}
            />
          ))}
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
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
  );
}

export function AvailStatsCharts({
  days,
  extrinsicDays,
  duration = 15,
}: {
  days: Node[];
  extrinsicDays: Node[];
  duration?: number;
}) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const visibleDays = days.slice(0, selectedDuration);
  const visibleExtrinsicDays = extrinsicDays.slice(0, selectedDuration);
  const byteTotal = visibleDays.reduce(
    (sum, day) => sum + number(day.totalByteSize),
    0,
  );
  const submissionTotal = visibleDays.reduce(
    (sum, day) => sum + number(day.totalDataSubmissionCount),
    0,
  );
  const feesTotal = visibleDays.reduce(
    (sum, day) => sum + number(day.totalFeesAvail),
    0,
  );
  return (
    <div className="border border-base-200 bg-base-100">
      <ChartPanelHeader
        title="Avail Stats"
        duration={selectedDuration}
        setDuration={setSelectedDuration}
      />
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-r border-base-200 p-5">
          <StackedBarChart
            days={visibleDays}
            field="totalByteSize"
            title="Byte Size"
            duration={selectedDuration}
            total={byteTotal}
            totalFormatter={formatBytes}
            valueFormatter={formatBytes}
            byteAxis
          />
        </div>
        <div className="h-[20em] p-5">
          <StackedBarChart
            days={visibleDays}
            field="totalDataSubmissionCount"
            title="DA subs"
            duration={selectedDuration}
            total={submissionTotal}
          />
        </div>
      </div>
      <div className="grid border-t border-base-200 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-r border-base-200 p-5">
          <StackedBarChart
            days={visibleDays}
            field="totalFeesAvail"
            title="DA Fees"
            duration={selectedDuration}
            total={feesTotal}
            totalFormatter={(value) => `${formatNumber(value)} AVAIL`}
            valueFormatter={(value) => `${formatNumber(value)} AVAIL`}
            reverseSeries
          />
        </div>
        <div className="h-[20em] p-5">
          <ExtrinsicStackedChart
            days={visibleExtrinsicDays}
            duration={selectedDuration}
          />
        </div>
      </div>
    </div>
  );
}

function ChartPanelHeader({
  title,
  duration,
  setDuration,
  withLogo = false,
}: {
  title: string;
  duration: number;
  setDuration: (duration: number) => void;
  withLogo?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-4 border-b border-base-200 p-5">
      <div className="flex items-center justify-center gap-2">
        {withLogo ? (
          <img
            src="/images/avail_logo.png"
            width="24"
            height="24"
            alt="Avail"
          />
        ) : null}
        <p>{title}</p>
      </div>
      <div className="flex gap-2">
        {[7, 30, 90].map((value) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm ${duration === value ? "btn-active" : ""}`}
            onClick={() => setDuration(value)}
          >
            {value}d
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvailUtilisationChart({
  lastBlock,
  blockCount,
  totalByteSize,
  totalSubmissionCount,
  maxBytes = 1_048_576 * 4,
}: {
  lastBlock: string | number;
  blockCount: number;
  totalByteSize: number;
  totalSubmissionCount: number;
  maxBytes?: number;
}) {
  const count = blockCount || 1;
  const averageDataPerBlock = number(totalByteSize) / count;
  const averageSubmissionCount = number(totalSubmissionCount) / count;
  const utilization = (averageDataPerBlock / maxBytes) * 100;
  const option: EChartsOption = {
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
        data: [{ value: Number((averageDataPerBlock / 1024).toFixed(2)) }],
      },
    ],
  };
  return (
    <div className="w-full rounded-lg border border-base-200 p-1">
      <div className="rounded-lg bg-base-100">
        <p className="w-full border-b border-base-200 p-3 text-xs">
          Space Utilization [Last {blockCount} Blocks]
        </p>
        <div className="grid h-full w-full lg:h-[17em] lg:grid-cols-2">
          <div className="h-[17em] w-full p-5">
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <div className="grid h-[15em] grid-cols-2 border-t border-base-200 lg:h-full lg:border-t-0">
            <GaugeMetric className="border-b lg:border-l" label="Block Height">
              {formatNumber(lastBlock, 0)}
            </GaugeMetric>
            <GaugeMetric
              className="border-b border-l"
              label="Space Utilization"
            >
              {utilization.toFixed(2)}%
            </GaugeMetric>
            <GaugeMetric className="lg:border-l" label="Avg. Size/Block">
              {formatBytes(averageDataPerBlock)}
            </GaugeMetric>
            <GaugeMetric className="border-l" label="Avg. subs/Block">
              {formatNumber(averageSubmissionCount)} Subs
            </GaugeMetric>
          </div>
        </div>
      </div>
    </div>
  );
}

function GaugeMetric({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center border-base-200 ${className ?? ""}`}
    >
      <p className="opacity-70">{label}</p>
      <p className="text-2xl font-bold">{children}</p>
    </div>
  );
}

type DetailField =
  | "totalDataSubmissionCount"
  | "totalExtrinsicCount"
  | "totalByteSize"
  | "totalFeesAvail";

function DetailBarChart({
  days,
  field,
  title,
  duration,
}: {
  days: Node[];
  field: DetailField;
  title: string;
  duration: number;
}) {
  const data: ChartDatum[] = days
    .map((day) => {
      const labels = dateLabels(day);
      return {
        timestamp: labels.long,
        timestampShort: labels.short,
        value: number(day[field]),
      };
    })
    .reverse();
  const total = data.reduce((sum, day) => sum + number(day.value), 0);
  const isBytes = field === "totalByteSize";
  const isFees = field === "totalFeesAvail";
  return (
    <div className="row-span-2 h-full w-full">
      <div className="flex justify-between">
        <p className="text-xs">{title}</p>
        <p className="text-xs">
          {isBytes
            ? formatBytes(total)
            : `${formatNumber(total, isFees ? 4 : 0)}${isFees ? " AVAIL" : ""}`}{" "}
          [{duration} days]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, left: -20, bottom: 30 }}
        >
          <defs>
            <linearGradient
              id={`avail-detail-${field}`}
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
            content={
              <DetailTooltip field={field} label={title} isBytes={isBytes} />
            }
          />
          <Bar
            dataKey="value"
            fill={`url(#avail-detail-${field})`}
            radius={10}
          />
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            tickFormatter={
              isBytes ? (value) => formatBytes(value, 0) : undefined
            }
          />
          <XAxis
            dataKey="timestampShort"
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

function DetailTooltip({
  active,
  payload,
  field,
  label,
  isBytes,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: ChartDatum }>;
  field: DetailField;
  label: string;
  isBytes: boolean;
}) {
  if (!active || !payload?.length) return null;
  const value = number(payload[0]?.value);
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{payload[0]?.payload?.timestamp}</p>
      <hr className="border-base-200" />
      <p className="px-4">
        {label}: {isBytes ? formatBytes(value) : formatNumber(value, 4)}
        {field === "totalFeesAvail" ? " AVAIL" : ""}
      </p>
    </div>
  );
}

export function AvailAccountBalanceChart({ days }: { days: Node[] }) {
  const data: ChartDatum[] = days
    .map((day) => {
      const labels = dateLabels(day);
      return {
        timestamp: labels.long,
        amountTotal: number(day.amountTotal) / 1e18,
      };
    })
    .reverse();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="avail-account-balance"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Legend
          verticalAlign="top"
          content={() => <span className="text-xs">Last 15 days balance</span>}
        />
        <Tooltip content={<BalanceTooltip />} />
        <Area
          type="monotone"
          dataKey="amountTotal"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#avail-account-balance)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BalanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: ChartDatum }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[20em]">
      <p className="px-4">{payload[0]?.payload?.timestamp}</p>
      <hr className="border-base-200" />
      <p className="px-4">
        AVAIL Balance: {formatNumber(payload[0]?.value, 4)}
      </p>
    </div>
  );
}

function DetailChartGrid({
  days,
  duration,
}: {
  days: Node[];
  duration: number;
}) {
  return (
    <div>
      <div className="grid lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <DetailBarChart
            days={days}
            field="totalDataSubmissionCount"
            title="DA Subs"
            duration={duration}
          />
        </div>
        <div className="h-[20em] p-5">
          <DetailBarChart
            days={days}
            field="totalExtrinsicCount"
            title="Extrinsic"
            duration={duration}
          />
        </div>
      </div>
      <div className="grid border-t border-base-200 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] border-b border-base-200 p-5 lg:border-b-0 lg:border-r">
          <DetailBarChart
            days={days}
            field="totalByteSize"
            title="Byte Size"
            duration={duration}
          />
        </div>
        <div className="h-[20em] p-5">
          <DetailBarChart
            days={days}
            field="totalFeesAvail"
            title="Extrinsic Fee"
            duration={duration}
          />
        </div>
      </div>
    </div>
  );
}

export function AvailAccountStatsCharts({
  days,
  duration = 15,
}: {
  days: Node[];
  duration?: number;
}) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  return (
    <div className="border border-base-200 bg-base-100">
      <ChartPanelHeader
        title="DA Stats"
        duration={selectedDuration}
        setDuration={setSelectedDuration}
        withLogo
      />
      <DetailChartGrid
        days={days.slice(0, selectedDuration)}
        duration={selectedDuration}
      />
    </div>
  );
}

export function AvailAppStatsCharts({
  days,
  duration = 15,
}: {
  days: Node[];
  duration?: number;
}) {
  const [selectedDuration, setSelectedDuration] = useState(duration);
  return (
    <div className="border border-base-200 bg-base-100">
      <ChartPanelHeader
        title="DA Stats"
        duration={selectedDuration}
        setDuration={setSelectedDuration}
        withLogo
      />
      <DetailChartGrid
        days={days.slice(0, selectedDuration)}
        duration={selectedDuration}
      />
    </div>
  );
}

export type AvailTvlDatum = {
  timestamp: number;
  tvlChart: number;
  nativeChart: number;
  canonicalChart: number;
  externalChart: number;
  native: number;
  canonical: number;
  external: number;
};

export function AvailTvlChart({ data }: { data: AvailTvlDatum[] }) {
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

function TvlTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: AvailTvlDatum & { timestampDate?: string };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const tvl =
    number(point?.canonical) + number(point?.native) + number(point?.external);
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs lg:w-[25em]">
      <p className="px-4">
        {new Date(number(point?.timestamp) * 1000).toString()}
      </p>
      <hr className="border-base-200" />
      <div className="space-y-3 px-4">
        <TvlTooltipRow color="#8884d8" label="TVL" value={tvl} prominent />
        <hr className="border-base-200" />
        <TvlTooltipRow
          color="#7e22ce"
          label="Canonical"
          value={number(point?.canonical)}
        />
        <TvlTooltipRow
          color="#be185d"
          label="Native"
          value={number(point?.native)}
        />
        <TvlTooltipRow
          color="#eab308"
          label="External"
          value={number(point?.external)}
        />
      </div>
    </div>
  );
}

function TvlTooltipRow({
  color,
  label,
  value,
  prominent = false,
}: {
  color: string;
  label: string;
  value: number;
  prominent?: boolean;
}) {
  return (
    <div className="flex w-full justify-between text-base">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-lg border border-base-300"
          style={{ backgroundColor: color }}
        />
        <p>{label}</p>
      </div>
      <p className={`font-bold opacity-70 ${prominent ? "text-lg" : ""}`}>
        $ {formatNumber(value)}
      </p>
    </div>
  );
}

export type AvailRiskDatum = {
  name: string;
  value?: string;
  valuePie: number;
  sentiment?: "good" | "bad" | "warning" | "neutral";
  description?: string;
};

export function AvailRiskPieChart({ data }: { data: AvailRiskDatum[] }) {
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
          label={RiskLabel}
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

function RiskLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  fill,
  payload,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  fill: string;
  payload: AvailRiskDatum;
}) {
  const radians = Math.PI / 180;
  const sin = Math.sin(-radians * midAngle);
  const cos = Math.cos(-radians * midAngle);
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

function RiskTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: AvailRiskDatum; color?: string }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="h-fit w-[25em] space-y-4 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs">
      <div className="flex justify-between gap-2 px-4">
        <p>
          {item?.name} ---- {item?.value}
        </p>
        <p className="capitalize">{item?.sentiment}</p>
      </div>
      <hr className="border-base-200" />
      <p className="px-4">{item?.description}</p>
    </div>
  );
}
