import { CelestiaSummaryView } from "@/views/Celestia/ServerViews";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Celestia | Analyze DA",
  description:
    "Unlock the power of DA Analytics for Celestia. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-celestia.jpeg"],
  },
};
export default function Page({
  searchParams,
}: {
  searchParams?: { blocksPage?: string };
}) {
  return (
    <CelestiaSummaryView blocksPage={Number(searchParams?.blocksPage || 1)} />
  );
}
