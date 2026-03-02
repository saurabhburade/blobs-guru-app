export const runtime = 'edge';
import SingleAvailApp from "@/views/Avail/Apps/SingleAvailApp";
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
  return <SingleAvailApp appId={appId as string} />;
}
