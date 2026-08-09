import { SummaryView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

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
      <SummaryView />
    </div>
  );
}
