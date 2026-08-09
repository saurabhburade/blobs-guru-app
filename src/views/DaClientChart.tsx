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

type Props = {
  values: number[];
  labels: string[];
  label: string;
  unit?: string;
  kind?: "bar" | "line";
};

export default function DaClientChart({
  values,
  labels,
  label,
  unit,
  kind = "bar",
}: Props) {
  const data = values.map((value, index) => ({
    label: labels[index] || String(index + 1),
    value,
  }));

  return (
    <figure className="h-full w-full" aria-label={label}>
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span>{unit}</span>
      </div>
      <div className="h-[calc(100%-1rem)]">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <AreaChart
              data={data}
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
                content={<DaTooltip unit={unit} />}
                cursor={{
                  fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))",
                  opacity: 0.1,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={label}
                stroke="#8884d8"
                fill="none"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
            >
              <Tooltip
                content={<DaTooltip unit={unit} />}
                cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
              />
              <Bar dataKey="value" name={label} fill="#8884d8" />
              <YAxis
                className="text-[10px] !text-current"
                axisLine={false}
                tickLine={false}
                tickFormatter={compact}
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

function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function DaTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-2 rounded-lg border border-base-200 bg-base-100 py-4 text-xs shadow lg:w-[20em]">
      <p className="px-4">{label}</p>
      <hr className="border-base-200" />
      {payload.map((item) => (
        <div
          className="flex items-center justify-between gap-4 px-4"
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
            {Number(item.value || 0).toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}{" "}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
