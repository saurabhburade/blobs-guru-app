export const dynamic = "force-dynamic";
import { CelestiaAppView } from "@/views/Celestia/ServerViews";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
  searchParams?: { txnPage?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appId } = await params;

  return {
    title: `Celestia App | ${appId}`,
    description: `Explore Celestia DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-celestia.jpeg"],
    },
  };
}

export default async function SingleAppPage({ params, searchParams }: Props) {
  const { appId } = await params;
  return (
    <CelestiaAppView
      id={appId}
      txnPage={Number(searchParams?.txnPage || 1)}
    />
  );
}
