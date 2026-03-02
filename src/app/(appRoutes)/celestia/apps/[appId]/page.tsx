
export const runtime = 'edge';
import SingleApp from "@/views/Celestia/Apps/SingleApp";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { appId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const appId = params.appId;

  return {
    title: `Celestia App | ${appId}`,
    description: `Explore Celestia DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-celestia.jpeg"],
    },
  };
}

export default function SingleAppPage({ params }: Props) {
  const { appId } = params;
  return <SingleApp appId={appId as string} />;
}
