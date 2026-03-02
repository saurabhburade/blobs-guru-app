export const runtime = 'edge';
import SingleAccount from "@/views/Celestia/SingleAccount";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;

  return {
    title: `Celestia Account | ${address}`,
    description: `Explore Celestia DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-celestia.jpeg"],
    },
  };
}

export default async function SingleAccPage({ params }: Props) {
  const { address } = await params;
  return <SingleAccount account={address} />;
}
