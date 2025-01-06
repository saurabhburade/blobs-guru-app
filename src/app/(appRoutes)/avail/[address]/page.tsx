import SingleAvailAccount from "@/views/Avail/SingleAvailAccount";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { address: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;

  return {
    title: `Avail Account | ${address}`,
    description: `Explore Avail DA stats for account ${address}`,
    openGraph: {
      images: ["/summary-avail.jpeg"],
    },
  };
}

export default function SingleAvailAccPage({ params }: Props) {
  const { address } = params;
  return <SingleAvailAccount account={address} />;
}
