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
export default async function AvailAppsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const query = await searchParams;

  return <AvailAppsView page={Number(query?.page || 1)} />;
}
