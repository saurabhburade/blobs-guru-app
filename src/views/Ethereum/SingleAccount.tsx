"use client";
import Header from "@/components/Header/Header";

import { formatAddress, formatBytes, formatEthereumValue } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { Box, Database, NotepadText, User } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { timeAgo } from "@/lib/time";
import Sidebar from "@/components/Sidebar/Sidebar";
import Footer from "@/components/Footer/Footer";
import PoweredBy from "../Home/components/PoweredBy";

import { apolloClient } from "@/lib/apollo/client";
import {
  ETHEREUM_ACCOUNT_SINGLE_QUERY,
  ETHEREUM_USER_TRANSACTIONS_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesEthereum";
import AccountStatCard from "./components/AccountStats/AccountStatCard";
import AccountStats from "./components/AccountStats/AccountStats";
import { checksumAddress } from "viem";
import L2BeatCard from "./Apps/AppStats/L2Beat/L2BeatCard";

type Props = {
  account: string;
};

function SingleAccount({ account }: Props) {
  const { data, loading, error } = useQuery(ETHEREUM_ACCOUNT_SINGLE_QUERY, {
    variables: {
      id: account,
    },
    client: apolloClient,
  });
  console.log(`🚀 ~ SingleAccount.tsx:36 ~ data:`, { data, error });

  return (
    <div className="grid xl:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="xl:block hidden">
        <Sidebar />
      </div>
      <div className="xl:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">Rollup Account</h2>
        </div>
        <div className="w-full space-y-4 ">
          <L2BeatCard account={account} />
          <div className="">
            <AccountStatCard
              acc={data?.accountEntities?.nodes[0]}
              isLoading={loading}
            />
          </div>
        </div>
        <AccountStats account={account} />
        <TxnRows account={account} />
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default SingleAccount;
const LIMIT_PER_PAGE = 10;
function TxnRows({ account }: { account: string }) {
  const [page, setPage] = useState(1);
  const {
    data: daData,
    loading,
    error,
  } = useQuery(ETHEREUM_USER_TRANSACTIONS_FILTER_LIMIT_QUERY, {
    variables: {
      signerId: checksumAddress(account as `0x${string}`),
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
    },
    client: apolloClient,
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p> Transactions</p>
      </div>
      <div className="hidden xl:grid xl:grid-cols-5 p-4 border-b text-end border-base-200 text-sm items-center">
        <div className="flex items-center gap-2">
          {" "}
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>{" "}
          Txn #
        </div>
        <p>From</p>
        <p>Module</p>
        <p>DA size</p>

        <p className="text-end">DA fee</p>
      </div>
      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton
                key={`TransactionRowSkeleton_SINGLE_ACCOUNT_${idx}`}
              />
            );
          })}
        {!loading &&
          daData?.transactionData?.nodes?.map((txn: any) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
      </div>
      <div className="flex px-4 justify-end gap-2  p-4  border-t border-base-200">
        {page > 1 && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setPage((prev) => {
                if (prev > 1) {
                  return prev - 1;
                }
                return prev;
              });
            }}
          >
            Prev
          </button>
        )}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setPage((prev) => prev + 1);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const TransactionRow = ({ txn }: any) => {
  const txFee = useMemo(() => {
    return new BigNumber(txn?.txFeeNative)?.div(10 ** 18).toFormat(5);
  }, [txn?.txFeeNative]);

  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-5 py-4 border-b border-base-200 text-sm items-center text-end">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link
              href={`/ethereum/txn/${txn?.hash?.replace("\\x", "0x")}`}
              className="text-primary"
            >
              {" "}
              {formatAddress(txn?.hash)?.replace("\\x", "0x")}
            </Link>

            <p>{timeAgo(new Date(Number(txn.timestamp)))}</p>
          </div>
        </div>
        {txn?.signerId ? <p>{formatAddress(txn?.signerId)}</p> : <p>-</p>}
        {txn?.nEvents ? (
          <div className="">
            <p>{txn?.nEvents}</p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <p>{formatBytes(txn?.totalBytes || 0)} </p>
        </div>

        <div>
          <p>{txn?.totalBytes > 0 ? txFee : 0} ETH </p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link href={`/ethereum/txn/${txn?.id}`} className="text-primary">
              {" "}
              {formatAddress(txn?.id)}
            </Link>
            <p>{timeAgo(new Date(txn.timestamp + "Z"))}</p>
          </div>
        </div>
        <div>
          <p>{formatBytes(txn?.totalBytes || 0)} </p>
        </div>
        <div className="hidden  md:block xl:hidden text-end">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">{txFee} ETH</p>
        </div>
        <div className="flex my-2 md:hidden  lg:my-0 justify-between  w-full  lg:col-span-1 ">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">{txFee} ETH</p>
        </div>
      </div>
    </>
  );
};
