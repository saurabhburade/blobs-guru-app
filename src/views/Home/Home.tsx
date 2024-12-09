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
import Sidebar from "@/components/Sidebar/Sidebar";
import TopAccountsStats from "../Stats/components/AccountStats/TopAccountsStats";
import AccountPies from "../Stats/components/AccountStats/Pies/AccountPies";
import AccountsBySizePieHome from "./components/AccountsBySizePieHome";
import { AccountRows } from "../Accounts/AccountsView";
import { useDAProvidersRaw } from "@/hooks/useDAProviders";
import BlobUtilisation from "../Size/components/BlobUtilisation";
import MotionNumber from "motion-number";
type Props = {};

function Home({}: Props) {
  const { data, loading: statsLoading } = useQuery(COLLECTIVE_STAT_QUERY);
  const r = useDAProvidersRaw();
  console.log(`🚀 ~ file: Home.tsx:27 ~ r:`, r);
  return (
    <div className="grid lg:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="lg:block hidden">
        <Sidebar />
      </div>
      <div className="lg:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">
            Ethereum Blobs Explorer
          </h2>
          <div className="">
            <SearchTxn />
          </div>
        </div>

        {/* <div className="bg-base-100 border border-base-200 ">
          <AccountsBySizePieHome collectiveData={data?.collectiveData} />
        </div> */}
        <div className="grid lg:grid-cols-2 lg:h-[20em] gap-4">
          <BlobUtilisation />

          <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200 border">
            <ETHPriceDayChart duration={60} />
          </div>
        </div>
        <div className="">
          <Stats />
        </div>
        <AccountRows />
        {/* <div className="lg:grid-cols-2 grid gap-8">
          <Transactions />
          <Blocks />
        </div> */}
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
  const { data, loading: statsLoading } = useQuery(COLLECTIVE_STAT_QUERY, {
    pollInterval: 10_000,
  });

  const blobsPerBlock = useMemo(() => {
    const totalBlk = new BigNumber(
      Number(data?.collectiveData?.lastUpdatedBlock)
    ).minus(Number(SYNC_START_BLOCK));
    const blobsPerBlockRaw = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    )
      .div(totalBlk)

      .toNumber();
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
      .toNumber();
    return totalFeeEthBn || 0;
  }, [data?.collectiveData?.totalFeeEth]);
  const totalBlobFeesEth = useMemo(() => {
    const totalFeeEthBn = new BigNumber(data?.collectiveData?.totalBlobGasEth)
      .div(1e18)
      .toNumber();
    return totalFeeEthBn || 0;
  }, [data?.collectiveData?.totalBlobGasEth]);

  const totalBlobFeesUSD = useMemo(() => {
    const totalBlobFeeBn = new BigNumber(data?.collectiveData?.totalBlobGasUSD)
      .div(1e18)
      .toNumber();
    return totalBlobFeeBn || 0;
  }, [data?.collectiveData?.totalBlobGasUSD]);

  const lastUpdatedBlock = useMemo(() => {
    const lastUpdatedBlockBn = new BigNumber(
      data?.collectiveData?.lastUpdatedBlock
    ).toNumber();

    return lastUpdatedBlockBn || 0;
  }, [data?.collectiveData?.lastUpdatedBlock]);

  const totalBlobAccounts = useMemo(() => {
    const totalBlobAccountsBn = new BigNumber(
      data?.collectiveData?.totalBlobAccounts
    ).toNumber();
    return totalBlobAccountsBn || 0;
  }, [data?.collectiveData?.totalBlobAccounts]);
  const totalBlobTransactionCount = useMemo(() => {
    const totalBlobTransactionCountBn = new BigNumber(
      data?.collectiveData?.totalBlobTransactionCount
    ).toNumber();
    return totalBlobTransactionCountBn || 0;
  }, [data?.collectiveData?.totalBlobTransactionCount]);
  const totalBlobHashesCount = useMemo(() => {
    const totalBlobHashesCountBn = new BigNumber(
      data?.collectiveData?.totalBlobHashesCount
    ).toNumber();
    return totalBlobHashesCountBn || 0;
  }, [data?.collectiveData?.totalBlobHashesCount]);
  const costPerKb = useMemo(() => {
    return new BigNumber(Number(data?.collectiveData?.totalBlobGasUSD))
      .div(Number(data?.collectiveData?.totalBlobGas))
      .div(1e18)
      .multipliedBy(1024)
      .toNumber();
  }, [data?.collectiveData?.totalBlobGasUSD]);
  const blobsPerSec = useMemo(() => {
    const blkTime = new BigNumber(
      Number(data?.collectiveData?.lastUpdatedBlock)
    )
      .minus(Number(SYNC_START_BLOCK))
      .multipliedBy(BLOCK_DURATION_SEC);
    return new BigNumber(data?.collectiveData?.totalBlobHashesCount)
      .div(blkTime)
      .toNumber();
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
      .toNumber();
  }, [data?.collectiveData?.totalBlobGasUSD]);
  return (
    <div className="grid lg:grid-cols-4 gap-0 rounded-lg overflow-hidden w-full ">
      <StatCard
        title="Block height"
        value={lastUpdatedBlock}
        isLoading={statsLoading}
      />
      <StatCard
        title="Total blob data"
        value={dataSize?.split(" ")[0]}
        isLoading={statsLoading}
        after={dataSize?.split(" ")[1]}
      />
      <StatCard
        title="Blob Fees"
        value={totalBlobFeesEth}
        isLoading={statsLoading}
        after="ETH"
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
        <div className="bg-base-100 row-span-2 h-[12em] border p-2 border-base-200">
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
        after="USD"
      />
      {/* <StatCard
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
      /> */}
    </div>
  );
};
const StatCard = ({
  title,
  value,
  isLoading,
  after,
}: {
  title: string;
  after?: string;
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
    <div className="h-full w-full bg-base-100 border-[0.5px] p-4 space-y-2 border-base-200">
      <p className=" text-sm opacity-50">{title || "Block Height"}</p>
      <MotionNumber
        className="text-2xl font-bold gap-1"
        value={value!}
        last={() => after && <p className="text-2xl font-bold"> {after}</p>}
      />
      {/* <p className=" text-2xl font-semibold">{value || "20,897,924"}</p> */}
    </div>
  );
};