export const runtime = 'edge';
import SingleBlock from "@/views/Ethereum/Blocks/SingleBlock";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ _blockNumber: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { _blockNumber: address } = await params;

  return {
    title: `EIP 4844 | Block ${address}`,
    description: `Explore EIP 4844 DA stats for block ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default async function SingleTxPage({ params }: Props) {
  const { _blockNumber } = await params;
  return <SingleBlock blockNumber={_blockNumber} />;
}
