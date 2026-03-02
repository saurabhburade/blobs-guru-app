export const runtime = 'edge';
import SingleAccount from "@/views/Ethereum/SingleAccount";
import SingleTxn from "@/views/Ethereum/Txn/SingleTxn";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { _hash: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params._hash;

  return {
    title: `EIP 4844 | Txn ${address}`,
    description: `Explore EIP 4844 DA stats for txn ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default function SingleTxPage({ params }: Props) {
  const { _hash } = params;
  return <SingleTxn hash={_hash} />;
}
