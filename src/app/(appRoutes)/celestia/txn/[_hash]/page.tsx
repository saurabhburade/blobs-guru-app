export const dynamic = "force-dynamic";
import { CelestiaTxnView } from "@/views/Celestia/ServerViews";

type Props = { params: Promise<{ _hash: string }> };

async function SingleBlockPage({ params }: Props) {
  const { _hash } = await params;
  return <CelestiaTxnView id={_hash} />;
}

export default SingleBlockPage;
