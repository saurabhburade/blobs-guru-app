export const dynamic = "force-dynamic";
import { CelestiaAppView } from "@/views/Celestia/ServerViews";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
  searchParams?: Promise<{ txnPage?: string }>;
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
  const query = await searchParams;

  return (
    <CelestiaAppView
      id={appId}
      txnPage={Number(query?.txnPage || 1)}
    />
  );
}
