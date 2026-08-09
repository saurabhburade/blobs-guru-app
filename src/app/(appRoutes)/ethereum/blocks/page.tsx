import { BlocksView } from "@/views/Ethereum/ServerViews";

export const revalidate = 300;

export default async function BlocksPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  return <BlocksView page={Number(searchParams?.page || 1)} />;
}
