import AvailSummary from "@/views/Avail/AvailSummary";
import Home from "@/views/Home/Home";
import Superchains from "@/views/OP/Superchains";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Avail | Analyze DA",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailPage() {
  return (
    <div className="">
      <AvailSummary />
    </div>
  );
}
