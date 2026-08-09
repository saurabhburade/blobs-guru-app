import { SingleAccountView } from "@/views/Ethereum/ServerViews";
import { Metadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
  searchParams?: { txnPage?: string };
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function SingleAppPage({ params, searchParams }: Props) {
  const { appId } = await params;
  return (
    <SingleAccountView
      account={appId}
      txnPage={Number(searchParams?.txnPage || 1)}
      basePath={`/ethereum/apps/${encodeURIComponent(appId)}`}
    />
  );
}
