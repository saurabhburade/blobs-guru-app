export const runtime = 'edge';
import SingleAvailAccount from "@/views/Avail/SingleAvailAccount";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;

  return {
    title: `Avail Account | ${address}`,
    description: `Explore Avail DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default async function SingleAvailAccPage({ params }: Props) {
  const { address } = await params;
  return <SingleAvailAccount account={address} />;
}
