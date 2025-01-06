import AvailAppsSummary from "@/views/Avail/Apps/AvailAppsSummary";
import AvailSummary from "@/views/Avail/AvailSummary";
import AvailStatsView from "@/views/Avail/Stats/AvailStatsView";
import Home from "@/views/Home/Home";
import Superchains from "@/views/OP/Superchains";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Avail | Stats",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailStatsPage() {
  return (
    <div className="">
      <AvailStatsView />
    </div>
  );
}
