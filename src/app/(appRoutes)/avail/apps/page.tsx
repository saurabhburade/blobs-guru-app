import { AvailAppsView } from "@/views/Avail/ServerViews";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Avail | Apps",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailAppsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  return <AvailAppsView page={Number(searchParams?.page || 1)} />;
}
