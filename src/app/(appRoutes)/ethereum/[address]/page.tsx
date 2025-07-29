import SingleAccount from "@/views/Ethereum/SingleAccount";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { address: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;

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
  return <SingleAccount account={address} />;
}
