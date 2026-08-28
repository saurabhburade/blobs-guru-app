export const runtime = 'edge';
import SingleAccount from "@/views/Ethereum/SingleAccount";
import { Metadata, ResolvingMetadata } from "next";
import { checksumAddress } from "viem";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address: rawAddress } = await params;
  const address = checksumAddress(rawAddress as `0xString`, 1);

  return {
    title: `EIP 4844 | ${address}`,
    description: `Explore EIP 4844 DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default async function SingleAccPage({ params }: Props) {
  const { address } = await params;

  return <SingleAccount account={checksumAddress(address as `0xString`, 1)} />;
}
