export const dynamic = "force-dynamic";
import { AvailBlockView } from "@/views/Avail/ServerViews";

type Props = { params: Promise<{ _blockNumber: string }> };

async function SingleAvailBlockPage({ params }: Props) {
  const { _blockNumber } = await params;
  return <AvailBlockView id={_blockNumber} />;
}

export default SingleAvailBlockPage;
