import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAvailApp = dynamic(() => import("@/views/Avail/Apps/SingleAvailApp"), { ssr: false });
const SingleAvailAccount = dynamic(() => import("@/views/Avail/SingleAvailAccount"), { ssr: false });
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { appId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const appId = params.appId;

  return {
    title: `Avail App | ${appId}`,
    description: `Explore Avail DA stats for app id ${appId}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default function SingleAvailAppPage({ params }: Props) {
  const { appId } = params;
  return <SingleAvailApp appId={appId as string} />;
}
