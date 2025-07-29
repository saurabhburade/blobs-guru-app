import SingleBlock from "@/views/Ethereum/Blocks/SingleBlock";
import SingleAccount from "@/views/Ethereum/SingleAccount";
import SingleTxn from "@/views/Ethereum/Txn/SingleTxn";
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
