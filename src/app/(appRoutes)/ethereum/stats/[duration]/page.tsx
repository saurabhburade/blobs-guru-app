import { StatsView } from "@/views/Ethereum/ServerViews";
import { notFound } from "next/navigation";

export const revalidate = 300;
export const dynamicParams = true;

const durations = ["7d", "30d", "90d"] as const;

export function generateStaticParams() {
  return [{ duration: "7d" }, { duration: "30d" }, { duration: "90d" }];
}

export default async function EthereumDurationStatsPage({
  params,
}: {
  params: Promise<{ duration: string }>;
}) {
  const { duration } = await params;
  if (!durations.includes(duration as (typeof durations)[number])) notFound();
  return <StatsView duration={Number.parseInt(duration, 10)} />;
}
