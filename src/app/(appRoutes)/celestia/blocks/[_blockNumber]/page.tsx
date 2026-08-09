export const dynamic = "force-dynamic";
import { CelestiaBlockView } from "@/views/Celestia/ServerViews";

type Props = { params: Promise<{ _blockNumber: string }> };

async function SingleBlockPage({ params }: Props) {
  const { _blockNumber } = await params;
  return <CelestiaBlockView id={_blockNumber} />;
}

export default SingleBlockPage;
