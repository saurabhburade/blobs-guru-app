import { redirect } from "next/navigation";

export const runtime = "edge";

type Props = {
  params: Promise<{ _blockNumber: string }>;
};

export default async function SingleBlockPage({ params }: Props) {
  const { _blockNumber } = await params;
  redirect(`/ethereum/blocks/${encodeURIComponent(_blockNumber)}`);
}
