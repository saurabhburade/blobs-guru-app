import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAvailAccount = dynamic(() => import("@/views/Avail/SingleAvailAccount"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { address: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;

  return {
    title: `Avail Account | ${address}`,
    description: `Explore Avail DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default function SingleAvailAccPage({ params }: Props) {
  const { address } = params;
  return <SingleAvailAccount account={address} />;
}
