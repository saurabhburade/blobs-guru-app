import { BlocksView } from "@/views/Ethereum/ServerViews";

export const revalidate = 300;

export default async function BlocksPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  return <BlocksView page={Number(query?.page || 1)} />;
}
