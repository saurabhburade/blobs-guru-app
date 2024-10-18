"use client";
import React, { useMemo } from "react";
import StatsOverviewCard from "./StatsOverviewCard";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { formatBytes } from "@/lib/utils";
import { COLLECTIVE_STAT_QUERY } from "@/lib/apollo/queries";

type Props = {};

function StatsOverview({}: Props) {
  //   id
  //   totalBlobTransactionCount
  //   totalGasEth
  //   lastUpdatedBlock
  //   totalFeeEth
  //   totalBlobGasEth
  //   totalBlobHashesCount
  //   totalBlobBlocks
  //   totalBlobAccounts
  //   totalBlobGas
  const { data, loading: statsLoading } = useQuery(COLLECTIVE_STAT_QUERY);

  const blobsPerBlock = useMemo(() => {
    const blobsPerBlockRaw = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    )
      .div(data?.collectiveData?.totalBlobBlocks)

      .toFormat(2);
    return blobsPerBlockRaw || 0;
  }, [
    data?.collectiveData?.totalBlobBlocks,
    data?.collectiveData?.totalBlobHashesCount,
  ]);
  const blobsPerTxn = useMemo(() => {
    const blobsPerTxnRaw = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    )
      .div(data?.collectiveData?.totalBlobTransactionCount)
      .toFormat(2);
    return blobsPerTxnRaw || 0;
  }, [
    data?.collectiveData?.totalBlobTransactionCount,
    data?.collectiveData?.totalBlobHashesCount,
  ]);
  const dataSize = useMemo(() => {
    if (data?.collectiveData?.totalBlobGas) {
      return formatBytes(Number(data?.collectiveData?.totalBlobGas));
    }
    return "0 KB";
  }, [data?.collectiveData?.totalBlobGas]);
  const dataSizePerBlock = useMemo(() => {
    if (data?.collectiveData?.totalBlobGas) {
      const gasPerBlock = new BigNumber(data?.collectiveData?.totalBlobGas).div(
        data?.collectiveData?.totalBlobBlocks
      );
      return formatBytes(Number(gasPerBlock));
    }
    return "0 KB";
  }, [
    data?.collectiveData?.totalBlobGas,
    data?.collectiveData?.totalBlobBlocks,
  ]);
  const dataSizePerTx = useMemo(() => {
    if (data?.collectiveData?.totalBlobGas) {
      const gasPerBlock = new BigNumber(data?.collectiveData?.totalBlobGas).div(
        data?.collectiveData?.totalBlobTransactionCount
      );
      return formatBytes(Number(gasPerBlock));
    }
    return "0 KB";
  }, [
    data?.collectiveData?.totalBlobGas,
    data?.collectiveData?.totalBlobTransactionCount,
  ]);
  const totalFeesEth = useMemo(() => {
    const totalFeeEthBn = new BigNumber(data?.collectiveData?.totalFeeEth)
      .div(1e18)
      .toFormat(2);
    return (totalFeeEthBn || 0) + " ETH";
  }, [data?.collectiveData?.totalFeeEth]);
  const totalBlobsFeesEth = useMemo(() => {
    const totalFeeEthBn = new BigNumber(data?.collectiveData?.totalBlobGasEth)
      .div(1e18)
      .toFormat(2);
    return (totalFeeEthBn || 0) + " ETH";
  }, [data?.collectiveData?.totalBlobGasEth]);

  const lastUpdatedBlock = useMemo(() => {
    const lastUpdatedBlockBn = new BigNumber(
      data?.collectiveData?.lastUpdatedBlock
    ).toFormat(0);
    return lastUpdatedBlockBn || 0;
  }, [data?.collectiveData?.lastUpdatedBlock]);
  const totalBlobBlocks = useMemo(() => {
    const totalBlobBlocksBn = new BigNumber(
      data?.collectiveData?.totalBlobBlocks
    ).toFormat(0);
    return totalBlobBlocksBn || 0;
  }, [data?.collectiveData?.totalBlobBlocks]);

  const totalBlobAccounts = useMemo(() => {
    const totalBlobAccountsBn = new BigNumber(
      data?.collectiveData?.totalBlobAccounts
    ).toFormat(0);
    return totalBlobAccountsBn || 0;
  }, [data?.collectiveData?.totalBlobAccounts]);
  const totalBlobTransactionCount = useMemo(() => {
    const totalBlobTransactionCountBn = new BigNumber(
      data?.collectiveData?.totalBlobTransactionCount
    ).toFormat(0);
    return totalBlobTransactionCountBn || 0;
  }, [data?.collectiveData?.totalBlobTransactionCount]);
  const totalBlobHashesCount = useMemo(() => {
    const totalBlobHashesCountBn = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    ).toFormat(0);
    return totalBlobHashesCountBn || 0;
  }, [data?.collectiveData?.totalBlobHashesCount]);

  return (
    <div className="grid lg:grid-cols-4 gap-0  ">
      <StatsOverviewCard
        title="Block height"
        value={lastUpdatedBlock}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Total blob blocks"
        value={totalBlobBlocks}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Blob Transactions"
        value={totalBlobTransactionCount}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Total Blobs"
        value={totalBlobHashesCount}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Total blob data"
        value={dataSize}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Total Fees"
        value={totalFeesEth}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Total Blobs Fees"
        value={totalBlobsFeesEth}
        isLoading={statsLoading}
      />

      <StatsOverviewCard
        title="Blob Accounts"
        value={totalBlobAccounts}
        isLoading={statsLoading}
      />

      <StatsOverviewCard
        title="Blobs per block"
        value={`${blobsPerBlock?.toString()} blobs/block`}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Blobs per transaction"
        value={`${blobsPerTxn?.toString()} blobs/tx`}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Data per block"
        value={`${dataSizePerBlock?.toString()}/block`}
        isLoading={statsLoading}
      />
      <StatsOverviewCard
        title="Data per transaction"
        value={`${dataSizePerTx?.toString()}/tx`}
        isLoading={statsLoading}
      />
    </div>
  );
}

export default StatsOverview;
