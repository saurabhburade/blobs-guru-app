import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_TRANSACTIONS_ACCOUNT_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
  BLOB_TRANSACTIONS_FOR_BLOCK,
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
    pollInterval: 15_000, // Every 15 sec
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
export const useAccountTransactionsWithRPCData = ({
  page,
  account,
}: {
  page: number;
  account: string;
}) => {
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_ACCOUNT_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      account,
    },
    pollInterval: 15_000, // Every 15 sec
  });
  const client = usePublicClient();

  const d = useReactQuery({
    queryKey: [page, data, account],
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
export const useBlockTransactionsWithRPCData = ({
  page,
  blockNumber,
}: {
  page: number;
  blockNumber: number;
}) => {
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_FOR_BLOCK, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      blockNumber,
    },
    pollInterval: 15_000, // Every 15 sec
  });
  const client = usePublicClient();

  const d = useReactQuery({
    queryKey: [page, data, blockNumber],
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
