export const dynamic = "force-dynamic";
import { AvailAppView } from "@/views/Avail/ServerViews";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appId } = await params;

  return {
    title: `Avail App | ${appId}`,
    description: `Explore Avail DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default async function SingleAvailAppPage({ params }: Props) {
  const { appId } = await params;
  return <AvailAppView id={appId} />;
}
