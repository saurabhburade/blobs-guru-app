"use client";

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

type Point = {
  label?: string;
  value: number;
  submissions?: number;
  feesUsd?: number;
  byteSize?: number;
};

type Format = "bytes" | "price" | "number";

function bytes(value: number) {
  let current = Number(value || 0);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (Math.abs(current) >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${units[unit]}`;
}

function number(value: number, digits = 2) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatted(value: number, format: Format) {
  if (format === "bytes") return bytes(value);
  if (format === "price") return `$${number(value, 2)}`;
  return number(value);
}

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
  format: Format;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="h-fit space-y-2 overflow-hidden rounded-lg border border-base-200 bg-base-100 py-4 text-xs shadow lg:w-[20em]">
      <p className="px-4">{label}</p>
      <hr className="border-base-200" />
      <div className="space-y-2 px-4">
        {payload.map((item) => (
          <div
            className="flex items-center justify-between gap-4"
            key={item.name}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-[10px] w-[10px]"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span>
              {formatted(
                Number(item.value || 0),
                item.name === "Byte Size" ? "bytes" : format,
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServerChart({
  points,
  label,
  format = "number",
}: {
  points: Point[];
  label: string;
  format?: Format;
}) {
  const isPrice = format === "price";
  const total = points.reduce(
    (sum, point) => sum + Number(point.value || 0),
    0,
  );
  const latest = points.at(-1);

  return (
    <figure className="h-[20em] rounded-lg bg-base-200/15 p-5">
      {isPrice ? (
        <div className="flex flex-wrap justify-between gap-4 border-b border-base-200 pb-4 lg:flex-nowrap lg:gap-2">
          <ChartHeadline
            color="#8884d8"
            label="ETH Price [Today]"
            value={formatted(latest?.value || 0, "price")}
          />
          <ChartHeadline
            label="Subs Count"
            value={number(latest?.submissions || 0, 0)}
          />
          <ChartHeadline
            color="orange"
            label="DA Fees"
            value={formatted(latest?.feesUsd || 0, "price")}
          />
          <ChartHeadline
            label="Data Size"
            value={bytes(latest?.byteSize || 0)}
          />
        </div>
      ) : (
        <figcaption className="flex justify-between text-xs">
          <span>{label}</span>
          <span>
            {formatted(total, format)} [{points.length} days]
          </span>
        </figcaption>
      )}

      <div
        className={isPrice ? "h-[calc(100%-4.5rem)]" : "h-[calc(100%-1rem)]"}
      >
        <ResponsiveContainer width="100%" height="100%">
          {isPrice ? (
            <AreaChart
              data={points}
              margin={{ top: 30, right: 5, left: 0, bottom: 10 }}
            >
              <XAxis
                dataKey="label"
                className="text-[10px] !text-current"
                angle={-45}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <Tooltip
                content={<ChartTooltip format={format} />}
                cursor={{
                  fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))",
                  opacity: 0.1,
                }}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                name="Subs Count"
                stroke="currentColor"
                fill="none"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="feesUsd"
                name="DA Fees"
                stroke="orange"
                fill="none"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="ETH Price"
                stroke="#8884d8"
                fill="none"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={points}
              margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
            >
              <Tooltip
                content={<ChartTooltip format={format} />}
                cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
              />
              <Bar dataKey="value" name={label} fill="#8884d8" />
              <YAxis
                className="text-[10px] !text-current"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatted(Number(value), format)}
              />
              <XAxis
                dataKey="label"
                className="text-[10px] !text-current"
                angle={-60}
                tickLine={false}
                axisLine={false}
                tickMargin={15}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function ChartHeadline({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm leading-none">
        {color ? (
          <span
            className="h-[10px] w-[10px]"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <span className="opacity-80">{label}</span>
      </div>
      <p className="font-bold leading-6">{value}</p>
    </div>
  );
}
