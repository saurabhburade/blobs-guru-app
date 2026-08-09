import { CelestiaStatsView } from "@/views/Celestia/ServerViews";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ duration: "7d" }, { duration: "30d" }, { duration: "90d" }];
}

export default async function CelestiaDurationStatsPage({
  params,
}: {
  params: Promise<{ duration: string }>;
}) {
  const { duration } = await params;
  return <CelestiaStatsView duration={Number.parseInt(duration, 10) || 90} />;
}
