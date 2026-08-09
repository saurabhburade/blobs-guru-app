import { StatsView } from "@/views/Ethereum/ServerViews";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ duration: "7d" }, { duration: "30d" }, { duration: "90d" }];
}

export default async function EthereumDurationStatsPage({
  params,
}: {
  params: Promise<{ duration: string }>;
}) {
  const { duration } = await params;
  return <StatsView duration={Number.parseInt(duration, 10) || 15} />;
}
