import { SummaryView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EIP 4844 | Analyze DA",
  description:
    "Unlock the power of DA Analytics for Ethereum Blobs. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-ethereum.jpeg"],
  },
};
export const revalidate = 300;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ blocksPage?: string }>;
}) {
  const query = await searchParams;
  return <SummaryView blocksPage={Number(query?.blocksPage || 1)} />;
}
