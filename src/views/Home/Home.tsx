"use client";

import Header from "@/components/Header/Header";
import React, { useMemo } from "react";
import Transactions from "./components/Transactions";
import Blocks from "./components/Blocks";
import { useQuery } from "@apollo/client";
import { COLLECTIVE_STAT_QUERY } from "@/lib/apollo/queries";
import { BigNumber } from "bignumber.js";
import { convertBytes, formatBytes } from "@/lib/utils";
import BlobTransactionDayChart from "./components/BlobTransactionDayChart";
import PoweredBy from "./components/PoweredBy";
import SearchTxn from "./components/SearchTxn";
import { BLOCK_DURATION_SEC, SYNC_START_BLOCK } from "@/configs/constants";
import ETHPriceDayChart from "../Stats/components/ETHPriceDayChart";
type Props = {};

function Home({}: Props) {
  return (
    <div>
      <Header />
      <div className="mx-auto p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="grid lg:grid-cols-2 w-full">
          <div className="lg:h-[40vh] h-[40vh] w-full flex-col flex justify-center gap-4 ">
            <h2 className="lg:text-5xl text-xl font-semibold">
              Blobs Explorer
            </h2>
            <SearchTxn />
          </div>
          <div className=" p-3 lg:p-5   h-[40vh] w-full  bg-base-100 rounded-lg border-base-200 border">
            {/* <HeatMap /> */}
            <ETHPriceDayChart duration={60} />
          </div>
        </div>
        <Stats />
        <div className="lg:grid-cols-2 grid gap-8">
          <Transactions />
          <Blocks />
        </div>
        <PoweredBy />
      </div>
    </div>
  );
}

export default Home;
const Stats = () => {
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
    const totalBlk = new BigNumber(
      Number(data?.collectiveData?.lastUpdatedBlock)
    ).minus(Number(SYNC_START_BLOCK));
    const blobsPerBlockRaw = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    )
      .div(totalBlk)

      .toFormat(2);
    return blobsPerBlockRaw || 0;
  }, [
    data?.collectiveData?.totalBlobBlocks,
    data?.collectiveData?.totalBlobHashesCount,
  ]);
  const dataSize = useMemo(() => {
    if (data?.collectiveData?.totalBlobGas) {
      return formatBytes(Number(data?.collectiveData?.totalBlobGas));
    }
    return "0 KB";
  }, [data?.collectiveData?.totalBlobGas]);

  const totalFeesEth = useMemo(() => {
    const totalFeeEthBn = new BigNumber(data?.collectiveData?.totalFeeEth)
      .div(1e18)
      .toFormat(2);
    return (totalFeeEthBn || 0) + " ETH";
  }, [data?.collectiveData?.totalFeeEth]);

  const totalBlobFeesUSD = useMemo(() => {
    const totalBlobFeeBn = new BigNumber(data?.collectiveData?.totalBlobGasUSD)
      .div(1e18)
      .toFormat(2);
    return (totalBlobFeeBn || 0) + " USD";
  }, [data?.collectiveData?.totalBlobGasUSD]);

  const lastUpdatedBlock = useMemo(() => {
    const lastUpdatedBlockBn = new BigNumber(
      data?.collectiveData?.lastUpdatedBlock
    ).toFormat(0);
    return lastUpdatedBlockBn || 0;
  }, [data?.collectiveData?.lastUpdatedBlock]);

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
  const costPerKb = useMemo(() => {
    return new BigNumber(Number(data?.collectiveData?.totalBlobGasUSD))
      .div(Number(data?.collectiveData?.totalBlobGas))
      .div(1e18)
      .multipliedBy(1024)
      .toFormat(6)
      .concat(" USD/KiB");
  }, [data?.collectiveData?.totalBlobGasUSD]);
  const blobsPerSec = useMemo(() => {
    const blkTime = new BigNumber(
      Number(data?.collectiveData?.lastUpdatedBlock)
    )
      .minus(Number(SYNC_START_BLOCK))
      .multipliedBy(BLOCK_DURATION_SEC);
    return new BigNumber(data?.collectiveData?.totalBlobHashesCount)
      .div(blkTime)
      .toFormat(4)
      .concat(" blobs/sec");
  }, [data?.collectiveData?.totalBlobGasUSD]);
  const dataPerSec = useMemo(() => {
    const blkTime = new BigNumber(
      Number(data?.collectiveData?.lastUpdatedBlock)
    )
      .minus(Number(SYNC_START_BLOCK))
      .multipliedBy(BLOCK_DURATION_SEC);
    return new BigNumber(Number(data?.collectiveData?.totalBlobGas))
      .div(blkTime)
      .div(1024)
      .toFormat(2)

      .concat(" KiB/sec");
  }, [data?.collectiveData?.totalBlobGasUSD]);
  return (
    <div className="grid lg:grid-cols-4 gap-0  ">
      <StatCard
        title="Block height"
        value={lastUpdatedBlock}
        isLoading={statsLoading}
      />
      <StatCard
        title="Total blob data"
        value={dataSize}
        isLoading={statsLoading}
      />
      <StatCard
        title="Total Fees"
        value={totalFeesEth}
        isLoading={statsLoading}
      />

      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className=""></div> */}
      {statsLoading && (
        <div className="bg-base-100  row-span-2 border p-2 border-base-200 animate-pulse">
          <div className="h-full w-full bg-base-100  space-y-2 border-base-200 animate-pulse flex justify-between items-end gap-4">
            <p className=" text-sm opacity-50 h-20 w-8 rounded-full bg-base-200 animate-pulse"></p>
            <p className=" text-sm opacity-50 h-16 w-8 rounded-full bg-base-200 animate-pulse"></p>
            <p className=" text-sm opacity-50 h-32 w-8 rounded-full bg-base-200 animate-pulse"></p>
            <p className=" text-sm opacity-50 h-20 w-8 rounded-full bg-base-200 animate-pulse"></p>
            <p className=" text-sm opacity-50 h-20 w-8 rounded-full bg-base-200 animate-pulse"></p>
            <p className=" text-sm opacity-50 h-40 w-8 rounded-full bg-base-200 animate-pulse"></p>
          </div>
        </div>
      )}
      {!statsLoading && (
        <div className="bg-base-100 row-span-2 border p-2 border-base-200">
          <BlobTransactionDayChart />
        </div>
      )}
      <StatCard
        title="Blob Transactions"
        value={totalBlobTransactionCount}
        isLoading={statsLoading}
      />
      <StatCard
        title="Total Blobs"
        value={totalBlobHashesCount}
        isLoading={statsLoading}
      />
      <StatCard
        title="Blob fee USD"
        value={totalBlobFeesUSD}
        isLoading={statsLoading}
      />
      <StatCard
        title="Blobs per block"
        value={`${blobsPerBlock?.toString()} blobs/block`}
        isLoading={statsLoading}
      />
      <StatCard
        title="Fee per KiB"
        value={costPerKb}
        isLoading={statsLoading}
      />
      <StatCard
        title="Blobs per sec"
        value={blobsPerSec}
        isLoading={statsLoading}
      />
      <StatCard
        title="Data per sec"
        value={`${dataPerSec?.toString()}`}
        isLoading={statsLoading}
      />
    </div>
  );
};
const StatCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string | number | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="h-full w-full bg-base-100 border p-4 space-y-2 border-base-200 animate-pulse">
        <p className=" text-sm opacity-50 h-5 w-20 rounded-full bg-base-200 animate-pulse"></p>
        <p className=" text-sm opacity-50 h-8 w-32 rounded-full bg-base-200 animate-pulse"></p>
      </div>
    );
  }
  return (
    <div className="h-full w-full bg-base-100 border p-4 space-y-2 border-base-200">
      <p className=" text-sm opacity-50">{title || "Block Height"}</p>
      <p className=" text-2xl font-semibold">{value || "20,897,924"}</p>
    </div>
  );
};
