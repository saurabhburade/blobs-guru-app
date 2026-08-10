import { CelestiaSearchView } from "@/views/Celestia/ServerViews";

export const dynamic = "force-dynamic";

export default async function CelestiaSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const query = await searchParams;

  return <CelestiaSearchView query={query} />;
}
