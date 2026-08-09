import { redirect } from "next/navigation";

export const runtime = "edge";

type Props = {
  params: Promise<{ _txnhash: string }>;
};

export default async function SingleTransactionPage({ params }: Props) {
  const { _txnhash } = await params;
  redirect(`/ethereum/txn/${encodeURIComponent(_txnhash)}`);
}
