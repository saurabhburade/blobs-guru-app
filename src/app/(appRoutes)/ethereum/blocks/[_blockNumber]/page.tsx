import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleBlock = dynamic(() => import("@/views/Ethereum/Blocks/SingleBlock"), { ssr: false });
const SingleAccount = dynamic(() => import("@/views/Ethereum/SingleAccount"), { ssr: false });
const SingleTxn = dynamic(() => import("@/views/Ethereum/Txn/SingleTxn"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { _blockNumber: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params._blockNumber;

  return {
    title: `EIP 4844 | Block ${address}`,
    description: `Explore EIP 4844 DA stats for block ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default function SingleTxPage({ params }: Props) {
  const { _blockNumber } = params;
  return <SingleBlock blockNumber={_blockNumber} />;
}
