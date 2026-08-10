import { AvailSearchView } from "@/views/Avail/ServerViews";

export const dynamic = "force-dynamic";

export default async function AvailSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const query = await searchParams;

  return <AvailSearchView query={query} />;
}
