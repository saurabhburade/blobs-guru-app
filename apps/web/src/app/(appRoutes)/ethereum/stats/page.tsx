import StatsView from "@/views/Ethereum/Stats/StatsView";
import Home from "@/views/Home/Home";
import Superchains from "@/views/OP/Superchains";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "EIP 4844 | Stats",
  description:
    "Unlock the power of DA Analytics for Ethereum Blobs. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-ethereum.jpeg"],
  },
};
export default function StatsPage() {
  return (
    <div className="">
      <StatsView />
    </div>
  );
}
