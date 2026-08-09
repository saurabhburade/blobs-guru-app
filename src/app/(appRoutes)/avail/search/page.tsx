import { AvailSearchView } from "@/views/Avail/ServerViews";

export const dynamic = "force-dynamic";

export default function AvailSearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  return <AvailSearchView query={searchParams} />;
}
