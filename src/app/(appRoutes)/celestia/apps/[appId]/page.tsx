export const runtime = 'edge';
import SingleApp from "@/views/Celestia/Apps/SingleApp";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ appId: string }>;
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

export default async function SingleAppPage({ params }: Props) {
  const { appId } = await params;
  return <SingleApp appId={appId as string} />;
}
