import { SummaryView } from "@/views/Ethereum/ServerViews";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Ethereum blobs | Blobs Guru",
  description: "Search Ethereum blob accounts and rollups.",
};

export default async function EthereumSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const query = await searchParams;
  return <SummaryView query={query?.query?.slice(0, 80)} />;
}
