export const runtime = 'edge';
import SingleAccount from "@/views/Ethereum/SingleAccount";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appId } = await params;

  return {
    title: `Ethereum Rollup | ${appId}`,
    description: `Explore Eip4844 DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default async function SingleAppPage({ params }: Props) {
  const { appId } = await params;
  return <SingleAccount account={appId as string} />;
}
