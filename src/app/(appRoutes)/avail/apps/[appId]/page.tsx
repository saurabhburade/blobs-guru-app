import SingleAvailApp from "@/views/Avail/Apps/SingleAvailApp";
import SingleAvailAccount from "@/views/Avail/SingleAvailAccount";
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
