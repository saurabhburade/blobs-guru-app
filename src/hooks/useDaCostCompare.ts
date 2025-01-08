import { availClient } from "@/lib/apollo/client";
import { BLOB_TRANSACTIONS_DA_COST_QUERY } from "@/lib/apollo/queries";
import { AVAIL_DA_COST_DATAS_QUERY } from "@/lib/apollo/queriesAvail";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";

export const useDaCostCompare = () => {
  const { data: availDaCostData, loading: availDaCostDataLoading } = useQuery(
    AVAIL_DA_COST_DATAS_QUERY,
    {
      client: availClient,
      pollInterval: 3_000,
      variables: {
        duration: 100,
      },
    }
  );
  const { data: ethDaCostData, loading: totalDataEthLoading } = useQuery(
    BLOB_TRANSACTIONS_DA_COST_QUERY,
    {
      pollInterval: 3_000,
      variables: {
        limit: 100,
      },
    }
  );

  const totalDataEth = ethDaCostData?.blobTransactions?.reduce(
    (acc: any, v: any) => {
      acc.totalBlobGasEth =
        Number(acc?.totalBlobGasEth || 0) +
        new BigNumber(v?.blobGasEth)?.div(1e18).toNumber();
      acc.totalBlobGasUSD =
        Number(acc?.totalBlobGasUSD || 0) +
        new BigNumber(v?.blobGasUSD)?.div(1e18).toNumber();

      acc.totalHashesLength =
        Number(acc?.totalHashesLength || 0) + parseInt(v?.blobHashesLength);

      acc.totaBlobGas =
        Number(acc?.totaBlobGas || 0) +
        new BigNumber(v?.blobGas)?.div(1024)?.div(1024)?.toNumber();

      acc.costPerMb = new BigNumber(acc.totalBlobGasEth)
        ?.div(acc.totaBlobGas)
        ?.toNumber();
      acc.costPerMbUSD = new BigNumber(acc.totalBlobGasUSD)
        ?.div(acc.totaBlobGas)
        ?.toNumber();

      return acc;
    },
    {
      totalBlobGasEth: 0,
      totalBlobGasUSD: 0,
      totalHashesLength: 0,
      totaBlobGas: 0,
      costPerMb: 0,
      costPerMbUSD: 0,
    }
  );
  const totalDataAvail = availDaCostData?.dataSubmissions?.nodes?.reduce(
    (acc: any, v: any) => {
      acc.totalBlobGasAvail =
        Number(acc?.totalBlobGasAvail || 0) +
        new BigNumber(v?.fees)?.toNumber();
      acc.totalBlobGasUSD =
        Number(acc?.totalBlobGasUSD || 0) +
        new BigNumber(v?.feesUSD)?.toNumber();

      acc.totalBytes =
        Number(acc?.totalBytes || 0) +
        new BigNumber(v?.byteSize)?.div(1024)?.div(1024)?.toNumber();

      acc.costPerMb = new BigNumber(acc.totalBlobGasAvail)
        ?.div(acc.totalBytes)
        ?.toNumber();
      acc.costPerMbUSD = new BigNumber(acc.totalBlobGasUSD)
        ?.div(acc.totalBytes)
        ?.toNumber();

      return acc;
    },
    {
      totalBlobGasAvail: 0,
      totalBlobGasUSD: 0,
      totalBytes: 0,
      costPerMb: 0,
      costPerMbUSD: 0,
    }
  );

  return {
    data: { totalDataAvail, totalDataEth },
    loading: availDaCostDataLoading || totalDataEthLoading,
  };
};
