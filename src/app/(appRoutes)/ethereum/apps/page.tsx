import { AccountsView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EIP 4844 | Rollups",
  description:
    "Unlock the power of DA Analytics for Ethereum Blobs. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-ethereum.jpeg"],
  },
};
export const revalidate = 300;

export default async function AppsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  return <AccountsView page={Number(query?.page || 1)} />;
}
