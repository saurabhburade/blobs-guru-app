import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleApp = dynamic(() => import("@/views/Celestia/Apps/SingleApp"), { ssr: false });
const SingleAccount = dynamic(() => import("@/views/Ethereum/SingleAccount"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { appId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const appId = params.appId;

  return {
    title: `Ethereum Rollup | ${appId}`,
    description: `Explore Eip4844 DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-ethereum.jpeg"],
    },
  };
}

export default function SingleAppPage({ params }: Props) {
  const { appId } = params;
  return <SingleAccount account={appId as string} />;
}
