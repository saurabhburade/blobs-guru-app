import { BLOB_BLOCKS_EXPLORER_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { hexToBigInt } from "viem";
import { usePublicClient } from "wagmi";

const LIMIT_PER_PAGE = 10;
export const useBlocksExplorerWithRPCData = ({ page }: { page: number }) => {
  const { data, loading } = useQuery(BLOB_BLOCKS_EXPLORER_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
    },
    // pollInterval: 20_000, // Every 10 sec
  });
  const client = usePublicClient();

  const d = useReactQuery({
    queryKey: [page, data],
    queryFn: async () => {
      if (client) {
        const calls = data?.blobBlockDatas?.map((blk: any, idx: number) => {
          const blockHex1 = Number(blk?.blockNumber)?.toString(16);

          return client.getBlock({
            includeTransactions: false,
            blockNumber: hexToBigInt(`0x${blockHex1}`),
          });
        });
        const blocksData = await Promise.all([...calls]);

        return blocksData;
      }
    },
    refetchOnWindowFocus: false,
    enabled: data?.blobBlockDatas?.length > 0,
  });
  const mappedData = data?.blobBlockDatas?.map((blk: any, idx: number) => {
    return {
      ...blk,
      rpcData: {
        ...d,
        data: d?.data ? d?.data[idx] : null,
      },
    };
  });
  return {
    data: mappedData,
    loading,
  };
};
