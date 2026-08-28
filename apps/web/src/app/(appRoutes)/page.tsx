import CelestiaSummary from "@/views/Celestia/CelestiaSummary";
import EthereumSummary from "@/views/Ethereum/EthereumSummary";
import Home from "@/views/Home/Home";
import Superchains from "@/views/OP/Superchains";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blobs Guru",
  description:
    "Unlock the power of DA Analytics for Ethereum EIP4844, Avail and Celestia. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary.jpeg"],
  },
};
export default function Page() {
  return (
    <div className="">
      <EthereumSummary />
    </div>
  );
}
