import { AvailStatsView } from "@/views/Avail/ServerViews";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Avail | Stats",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailStatsPage() {
  return <AvailStatsView />;
}
