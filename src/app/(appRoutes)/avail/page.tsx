import { AvailSummaryView } from "@/views/Avail/ServerViews";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Avail | Analyze DA",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailPage({
  searchParams,
}: {
  searchParams?: { blocksPage?: string };
}) {
  return <AvailSummaryView blocksPage={Number(searchParams?.blocksPage || 1)} />;
}
