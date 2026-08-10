import { SingleAccountView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
  searchParams?: Promise<{ txnPage?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address: rawAddress } = await params;
  const address = rawAddress;

  return {
    title: `EIP 4844 | ${address}`,
    description: `Explore EIP 4844 DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SingleAccPage({ params, searchParams }: Props) {
  const { address } = await params;
  const query = await searchParams;

  return (
    <SingleAccountView
      account={address}
      txnPage={Number(query?.txnPage || 1)}
    />
  );
}
