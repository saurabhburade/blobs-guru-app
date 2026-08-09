import { AvailAccountsView } from "@/views/Avail/ServerViews";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Avail | Accounts",
  description:
    "Unlock the power of DA Analytics for Avail. Analyze decentralized data availability, enhanced scalability and performance.",
  openGraph: {
    images: ["/summary-avail.jpeg"],
  },
};
export default function AvailAccountsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  return <AvailAccountsView page={Number(searchParams?.page || 1)} />;
}
