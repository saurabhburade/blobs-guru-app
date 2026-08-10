import { CelestiaStatsView } from "@/views/Celestia/ServerViews";
import { notFound } from "next/navigation";

export const revalidate = 300;
export const dynamicParams = true;

const durations = ["7d", "30d", "90d"] as const;

export function generateStaticParams() {
  return [{ duration: "7d" }, { duration: "30d" }, { duration: "90d" }];
}

export default async function CelestiaDurationStatsPage({
  params,
}: {
  params: Promise<{ duration: string }>;
}) {
  const { duration } = await params;
  if (!durations.includes(duration as (typeof durations)[number])) notFound();
  return <CelestiaStatsView duration={Number.parseInt(duration, 10)} />;
}
