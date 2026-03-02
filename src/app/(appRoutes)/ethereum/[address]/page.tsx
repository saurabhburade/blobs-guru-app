import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAccount = dynamic(() => import("@/views/Ethereum/SingleAccount"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";
import { checksumAddress } from "viem";

type Props = {
  params: { address: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = checksumAddress(params.address as `0xString`, 1);

  return {
    title: `EIP 4844 | ${address}`,
    description: `Explore EIP 4844 DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default function SingleAccPage({ params }: Props) {
  const { address } = params;

  return <SingleAccount account={checksumAddress(address as `0xString`, 1)} />;
}
