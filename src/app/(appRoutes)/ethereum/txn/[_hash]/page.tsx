import { SingleTxnView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

type Props = {
  params: Promise<{ _hash: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { _hash: address } = await params;

  return {
    title: `EIP 4844 | Txn ${address}`,
    description: `Explore EIP 4844 DA stats for txn ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SingleTxPage({ params }: Props) {
  const { _hash } = await params;
  return <SingleTxnView hash={_hash} />;
}
