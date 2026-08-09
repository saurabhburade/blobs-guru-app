
import { CelestiaAppsView } from "@/views/Celestia/ServerViews";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Celestia | Apps",
  description:
    "Unlock the power of DA Analytics for Celestia. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-celestia.jpeg"],
  },
};
export default function AppsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  return <CelestiaAppsView page={Number(searchParams?.page || 1)} />;
}
