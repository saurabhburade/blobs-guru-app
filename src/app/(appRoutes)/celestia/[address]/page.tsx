import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAccount = dynamic(() => import("@/views/Celestia/SingleAccount"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { address: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;

  return {
    title: `Celestia Account | ${address}`,
    description: `Explore Celestia DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-celestia.jpeg"],
    },
  };
}

export default function SingleAccPage({ params }: Props) {
  const { address } = params;
  return <SingleAccount account={address} />;
}
