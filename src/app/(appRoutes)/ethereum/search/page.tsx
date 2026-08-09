import { SummaryView } from "@/views/Ethereum/ServerViews";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Ethereum blobs | Blobs Guru",
  description: "Search Ethereum blob accounts and rollups.",
};

export default function EthereumSearchPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  return <SummaryView query={searchParams?.query?.slice(0, 80)} />;
}
