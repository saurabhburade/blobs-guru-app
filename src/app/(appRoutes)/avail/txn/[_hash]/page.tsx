export const dynamic = "force-dynamic";
import { AvailTxnView } from "@/views/Avail/ServerViews";

type Props = { params: Promise<{ _hash: string }> };

async function SingleAvailBlockPage({ params }: Props) {
  const { _hash } = await params;
  return <AvailTxnView id={_hash} />;
}

export default SingleAvailBlockPage;
