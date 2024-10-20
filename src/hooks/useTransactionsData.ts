import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
} from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { hexToBigInt } from "viem";
import { usePublicClient } from "wagmi";

const LIMIT_PER_PAGE = 10;
export const useTransactionsExplorerWithRPCData = ({
  page,
}: {
  page: number;
}) => {
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_EXPLORER_QUERY, {
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
        const calls = data?.blobTransactions?.map((txn: any, idx: number) => {
          return client.getTransaction({
            hash: txn?.id,
          });
        });
        const txnsData = await Promise.all([...calls]);

        return txnsData;
      }
    },
    refetchOnWindowFocus: false,
    enabled: data?.blobTransactions?.length > 0,
  });
  const mappedData = data?.blobTransactions?.map((txn: any, idx: number) => {
    return {
      ...txn,
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
