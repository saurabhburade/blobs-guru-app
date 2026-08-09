export const dynamic = "force-dynamic";
import { AvailAccountView } from "@/views/Avail/ServerViews";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
  searchParams?: { txnPage?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;

  return {
    title: `Avail Account | ${address}`,
    description: `Explore Avail DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default async function SingleAvailAccPage({
  params,
  searchParams,
}: Props) {
  const { address } = await params;
  return (
    <AvailAccountView
      id={address}
      txnPage={Number(searchParams?.txnPage || 1)}
    />
  );
}
