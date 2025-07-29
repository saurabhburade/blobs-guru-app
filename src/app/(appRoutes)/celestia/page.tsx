import CelestiaSummary from "@/views/Celestia/CelestiaSummary";
import Home from "@/views/Home/Home";
import Superchains from "@/views/OP/Superchains";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Celestia | Analyze DA",
  description:
    "Unlock the power of DA Analytics for Celestia. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-celestia.jpeg"],
  },
};
export default function Page() {
  return (
    <div className="">
      <CelestiaSummary />
    </div>
  );
}
