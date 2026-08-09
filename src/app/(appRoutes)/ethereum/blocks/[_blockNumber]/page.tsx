import { SingleBlockView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SingleTxPage({ params }: Props) {
  const { _blockNumber } = await params;
  return <SingleBlockView blockNumber={_blockNumber} />;
}
