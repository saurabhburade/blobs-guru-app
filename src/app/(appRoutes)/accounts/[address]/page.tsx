import { redirect } from "next/navigation";

export const runtime = "edge";

type Props = {
  params: Promise<{ address: string }>;
};

export default async function SingleAccountPage({ params }: Props) {
  const { address } = await params;
  redirect(`/ethereum/${encodeURIComponent(address.toLowerCase())}`);
}
