"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import React from "react";
import rawSuperchainList from "@/configs/opchains.json";
import { useOpStackAccountsData } from "@/hooks/useOpStack";
import MotionNumber from "motion-number";
import {
  BLOCK_DURATION_SEC,
  getAccountDetailsFromAddressBook,
  SYNC_START_BLOCK,
} from "@/configs/constants";
import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { formatAddress, formatBytes } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import ImageWithFallback from "@/components/ImageWithFallback";
import PoweredBy from "../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";
type Props = {};

function Superchains({}: Props) {
  const superList = rawSuperchainList?.filter(
    (s) =>
      s.is_op_chain === "True" &&
      s.da_layer === "ethereum" &&
      s.batchinbox_from?.trim() !== ""
  );

  const d = useOpStackAccountsData(superList);

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
          <h2 className="lg:text-2xl text-xl font-semibold text-[#ff0420] font-extrabold uppercase font-sans">
            Optimism <span className="">SUPERCHAINS</span>
          </h2>
        </div>
        <div className="w-full space-y-4">
          {/* <SuperchainList /> */}

          <Stats data={d?.data} statsLoading={d.loading} />
          <AccountRows
            data={{ accounts: d?.data?.mappedChains }}
            loading={d.loading}
          />
        </div>
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default Superchains;

const Stats = ({ data, statsLoading }: any) => {
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
    <div className="grid lg:grid-cols-4 gap-0 rounded-lg  w-full ">
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
      <StatCard
        title="Txn Fees"
        value={totalFeesEth}
        isLoading={statsLoading}
        after="ETH"
      />
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
      <StatCard
        title="Data per sec [avg]"
        value={`${dataPerSec?.toString()}`}
        isLoading={statsLoading}
        after="KiB"
      />{" "}
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
      <div className="h-full w-full bg-base-100 border p-4  border-[0.5px]  space-y-2 border-base-200 animate-pulse">
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
    </div>
  );
};

export function AccountRows({ data, loading }: any) {
  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="hidden xl:grid xl:grid-cols-7 py-4 px-4  border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 col-span-2 ">Rollup</div>
        <p>Address</p>
        <p>Size</p>
        <p>Blobs</p>
        <p>Transactions</p>
        <p>Fees</p>
      </div>

      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton
                key={`TransactionRowSkeleton_ACCOUNTS_${idx}`}
              />
            );
          })}
        {data?.accounts?.map((acc: any) => {
          return <AccountRow key={acc?.id} acc={acc} />;
        })}
      </div>
    </div>
  );
}

const AccountRow = ({ acc }: any) => {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalBlobGas));
  }, [acc?.totalBlobGas]);
  const totalBlobGasEth = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasEth).div(1e18).toFormat(4);
  }, [acc?.totalBlobGasEth]);
  const totalBlobGasEthUSD = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasUSD).div(1e18).toFormat(0);
  }, [acc?.totalBlobGasUSD]);
  const totalFeeEth = useMemo(() => {
    return new BigNumber(acc?.totalFeeEth).div(1e18).toFormat(4);
  }, [acc?.totalFeeEth]);
  const blobsPerBlock = useMemo(() => {
    return new BigNumber(Number(acc?.totalBlobHashesCount))
      .div(Number(acc?.totalBlobBlocks))
      .toFormat(4);
  }, [acc?.totalBlobHashesCount, acc?.totalBlobBlocks]);
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 last:border-b-0 border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 col-span-2 ">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <ImageWithFallback
              src={
                accountDetails?.logoUri ||
                `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/${acc?.l2beat_slug}.png`
              }
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
          </div>
          <div>
            {acc?.display_name ? (
              <div>
                <Link className="text-primary" href={`/accounts/${acc?.id}`}>
                  {acc?.display_name}
                </Link>

                <Link
                  className="text-primary block lg:hidden"
                  href={`/accounts/${acc?.id}`}
                >
                  {formatAddress(acc?.id)}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  className="text-primary hidden lg:block"
                  href={`/accounts/${acc?.id}`}
                >
                  {formatAddress(acc?.id)}
                </Link>
                <Link
                  className="text-primary block lg:hidden"
                  href={`/accounts/${acc?.id}`}
                >
                  {formatAddress(acc?.id)}
                </Link>{" "}
              </>
            )}
          </div>
        </div>
        <p>
          {" "}
          <Link className=" hidden lg:block" href={`/accounts/${acc?.id}`}>
            {formatAddress(acc?.id)}
          </Link>
        </p>
        <div>
          <p>{totalBlobSize}</p>
        </div>
        <div>
          <p>{new BigNumber(acc?.totalBlobHashesCount).toFormat(0)}</p>
        </div>

        <div>
          <p>{new BigNumber(acc?.totalBlobTransactionCount).toFormat(0)}</p>
        </div>

        <div>
          <p>{totalBlobGasEth} ETH</p>
          <p>${totalBlobGasEthUSD}</p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
              <ImageWithFallback
                src={
                  accountDetails?.logoUri ||
                  `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/${acc?.l2beat_slug}.png`
                }
                className="rounded-lg"
                width={24}
                height={24}
                alt=""
              />
            </div>

            <div>
              {acc?.display_name ? (
                <div>
                  <p>{acc?.display_name}</p>

                  <Link
                    className="text-primary block lg:hidden"
                    href={`/accounts/${acc?.id}`}
                  >
                    {formatAddress(acc?.id)}
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    className="text-primary hidden lg:block"
                    href={`/accounts/${acc?.id}`}
                  >
                    {formatAddress(acc?.id)}
                  </Link>
                  <Link
                    className="text-primary block lg:hidden"
                    href={`/accounts/${acc?.id}`}
                  >
                    {formatAddress(acc?.id)}
                  </Link>{" "}
                </>
              )}
            </div>
          </div>
          <div className="text-end">
            <p>{totalBlobSize}</p>
          </div>
        </div>
      </div>
    </>
  );
};
