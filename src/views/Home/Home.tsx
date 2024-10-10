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
type Props = {};

function Home({}: Props) {
  return (
    <div>
      <Header />
      <div className="mx-auto p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-8 lg:pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="lg:h-[30vh] h-[40vh] flex-col flex justify-center gap-4 ">
          <h2 className="lg:text-5xl text-xl font-semibold">Blobs Explorer</h2>
          <div className="join">
            <input
              className="input w-full input-bordered outline-none active:outline-none  focus:outline-none join-item lg:w-1/3 "
              placeholder="Search transactions"
            />
            <button className="btn join-item rounded-r-full">Search</button>
          </div>
        </div>
        <Stats />
        <div className="lg:grid-cols-2 grid gap-8">
          <Transactions />
          <Blocks />
        </div>
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
  const { data } = useQuery(COLLECTIVE_STAT_QUERY);
  console.log(`🚀 ~ file: Home.tsx:39 ~ data:`, data?.collectiveData);
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

  return (
    <div className="grid lg:grid-cols-4 gap-0  lg:h-[12em]">
      <StatCard title="Block height" value={lastUpdatedBlock} />
      <StatCard title="Total blob data" value={dataSize} />
      <StatCard title="Total Fees" value={totalFeesEth} />

      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className="h-52 w-full bg-base-200 rounded-lg"></div> */}
      {/* <div className=""></div> */}
      <div className="bg-base-100 h-[12em] row-span-2 border p-2 border-base-200">
        <BlobTransactionDayChart />
      </div>
      <StatCard title="Blob Accounts" value={totalBlobAccounts} />
      <StatCard title="Blob Transactions" value={totalBlobTransactionCount} />
      <StatCard title="Total Blobs" value={totalBlobHashesCount} />
    </div>
  );
};
const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number | null;
}) => {
  return (
    <div className="h-full w-full bg-base-100 border p-4 space-y-2 border-base-200">
      <p className=" text-sm opacity-50">{title || "Block Height"}</p>
      <p className=" text-2xl font-semibold">{value || "20,897,924"}</p>
    </div>
  );
};
