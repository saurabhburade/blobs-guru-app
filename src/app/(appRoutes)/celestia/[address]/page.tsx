export const dynamic = "force-dynamic";
import { CelestiaAccountView } from "@/views/Celestia/ServerViews";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
  searchParams?: { txnPage?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;

  return {
    title: `Celestia Account | ${address}`,
    description: `Explore Celestia DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-celestia.jpeg"],
    },
  };
}

export default async function SingleAccPage({ params, searchParams }: Props) {
  const { address } = await params;
  return (
    <CelestiaAccountView
      id={address}
      txnPage={Number(searchParams?.txnPage || 1)}
    />
  );
}
