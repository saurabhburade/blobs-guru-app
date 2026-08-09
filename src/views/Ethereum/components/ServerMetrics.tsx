export function MetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-0 rounded-lg lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="h-full w-full space-y-2 border-[0.5px] border-base-200 bg-base-100 p-4"
        >
          <p className="text-sm opacity-50">{metric.label}</p>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  message = "No data available.",
}: {
  message?: string;
}) {
  return (
    <p className="rounded-lg border border-dashed border-base-300 p-8 text-center opacity-60">
      {message}
    </p>
  );
}
