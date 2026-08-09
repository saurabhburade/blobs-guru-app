import { CelestiaSearchView } from "@/views/Celestia/ServerViews";

export const dynamic = "force-dynamic";

export default function CelestiaSearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  return <CelestiaSearchView query={searchParams} />;
}
