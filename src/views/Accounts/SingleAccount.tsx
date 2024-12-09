"use client";
import Header from "@/components/Header/Header";
import {
  BLOB_ACCOUNT_SINGLE_QUERY,
  BLOB_ACCOUNTS_EXPLORER_QUERY,
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  BLOB_TRANSACTIONS_ACCOUNT_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
  COLLECTIVE_STAT_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes, formatEthereumValue } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { Box, Database, NotepadText, User } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import BlobTransactionDayChart from "../Home/components/BlobTransactionDayChart";
import BlobSizeDayChart from "./components/TopBlobAccountsChart";
import TopBlobAccountsChart from "./components/TopBlobAccountsChart";
import BlobAccountsDayChart from "./components/BlobAccountsDayChart";
import TopAccountsByBlobHashes from "./components/TopAccountsByBlobHashes";
import BlobHashesDayChart from "./components/BlobHashesDayChart";
import Echart from "./components/TopAccountsChart";
import TopAccountsChart from "./components/TopAccountsChart";
import AccountStatCard from "./components/AccountStatCard";
import DayTxnsBlobAccountChart from "./components/DayTxnsBlobAccountChart";
import DayHashesBlobAccountChart from "./components/DayHashesBlobAccountChart";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import axios from "axios";
import L2BeatCard from "./components/L2Beat/L2BeatCard";
import { useAccountTransactionsWithRPCData } from "@/hooks/useTransactionsData";
import { timeAgo } from "@/lib/time";
import AccountDayStats from "./components/AccountStats/AccountDayStats";
import Sidebar from "@/components/Sidebar/Sidebar";

type Props = {
  account: string;
};

function SingleAccount({ account }: Props) {
  // const account = "0x2c169dfe5fbba12957bdd0ba47d9cedbfe260ca7";
  const { data, loading } = useQuery(BLOB_ACCOUNT_SINGLE_QUERY, {
    variables: {
      address: account,
    },
  });
  const accountDetails = getAccountDetailsFromAddressBook(
    account?.toLowerCase()
  );
  const { data: l2BeatAccountDetails } = useQueryFetch({
    queryKey: ["l2BeatAccountDetails", account],
    queryFn: async () => {
      const d = await axios.get(accountDetails?.l2beatProjectDataUrl);
      return d?.data;
    },
  });
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
          <h2 className="lg:text-xl text-xl font-semibold">L2 Rollups</h2>
        </div>
        <div className="w-full space-y-4 ">
          <L2BeatCard account={account} />
          <div className="">
            <AccountStatCard acc={data?.account} isLoading={loading} />
          </div>
          <AccountDayStats account={account} />
        </div>
        <TxnRows account={account} />
      </div>
    </div>
  );
}

export default SingleAccount;
const LIMIT_PER_PAGE = 10;
function TxnRows({ account }: { account: string }) {
  const [page, setPage] = useState(1);
  const { data, loading } = useAccountTransactionsWithRPCData({
    page,
    account,
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Transactions</p>
      </div>
      <div className="hidden xl:grid xl:grid-cols-7 p-4 border-b text-end border-base-200 text-sm items-center">
        <div className="flex items-center gap-2">
          {" "}
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>{" "}
          Txn #
        </div>
        <p>From</p>
        <p>To</p>
        <p>Blob size</p>
        <p>Position</p>
        <p>Txn fee</p>
        <p className="text-end">Blob fee</p>
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
          data?.map((txn: any) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
        {/* <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow /> */}
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
  //       id
  //   from
  //   to
  //   blobHashesLength
  //   nonce
  //   gasPrice
  //   gasUsed
  //   blobGasEth
  //   blobGas
  const accountDetails = getAccountDetailsFromAddressBook(txn?.from);
  const blobFeeGwei = useMemo(() => {
    return new BigNumber(txn?.blobGasEth).div(1e9).toFormat(5);
  }, [txn?.blobGasEth]);

  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(txn?.blobGas));
  }, [txn?.blobGas]);
  const blobGasEth = useMemo(() => {
    return new BigNumber(txn?.blobGasEth).div(1e18).toFormat(4);
  }, [txn?.blobGasEth]);
  const feeEth = useMemo(() => {
    return new BigNumber(txn?.gasUsed)
      .multipliedBy(Number(txn?.gasPrice))
      .div(1e18)
      .toFormat(4);
  }, [txn?.gasUsed, txn?.gasPrice]);
  const ethBurn = useMemo(() => {
    return new BigNumber(txn?.rpcData?.data?.baseFeePerGas)
      .multipliedBy(Number(txn?.rpcData?.data?.gasUsed))
      .div(1e18)
      .toFormat(5);
  }, [txn?.rpcData]);
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 border-b border-base-200 text-sm items-center text-end">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            {accountDetails?.logoUri ? (
              <img
                src={accountDetails?.logoUri || "/images/logox.jpeg"}
                className="rounded-lg"
                width={24}
                height={24}
                alt=""
              />
            ) : (
              <NotepadText strokeWidth="1" width={24} height={24} />
            )}
          </div>
          <div>
            <Link className="text-primary" href={`/transactions/${txn?.id}`}>
              {formatAddress(txn?.id)}
            </Link>

            <p>{timeAgo(new Date(Number(txn?.timestamp) * 1000))}</p>
          </div>
        </div>
        {txn?.from ? (
          <Link href={`/accounts/${txn?.from}`} className="">
            {accountDetails?.name ? (
              <div>
                <p className="text-primary">{accountDetails?.name}</p>
                <p>{formatAddress(txn?.from)}</p>
              </div>
            ) : (
              <div>
                <p className="text-primary">{formatAddress(txn?.from)}</p>
              </div>
            )}
          </Link>
        ) : (
          <p>-</p>
        )}
        {txn?.to ? (
          <div className="">
            <p>{formatAddress(txn?.to)}</p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <p>{totalBlobSize}</p>
          <p>{txn?.blobHashesLength} blobs</p>
        </div>
        <div>
          <p>
            <span>
              <Link
                href={`/blocks/${txn?.blockNumber}`}
                className="text-primary"
              >
                {txn?.blockNumber}
              </Link>{" "}
            </span>{" "}
            : {txn?.index}
          </p>
        </div>

        <div>
          <p>{feeEth} ETH</p>
        </div>
        {blobFeeGwei && !isNaN(Number(txn?.blobGasEth)) ? (
          <div className="">
            <p>{formatEthereumValue(Number(txn?.blobGasEth))}</p>
          </div>
        ) : (
          <p>-</p>
        )}
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link className="text-primary" href={`/transactions/${txn?.id}`}>
              {formatAddress(txn?.id)}
            </Link>

            <p>{timeAgo(new Date(Number(txn.timestamp) * 1000))}</p>
          </div>
        </div>
        <div>
          <p>{totalBlobSize}</p>
          <p>{txn?.blobHashesLength} blobs</p>
        </div>
        <div className="hidden  md:block xl:hidden text-end">
          <Link
            href={`/accounts/${txn?.from}`}
            className="lg:text-end text-primary"
          >
            From : {accountDetails?.name || formatAddress(txn?.from)}
          </Link>
          <p className=" text-end">{feeEth} ETH</p>
        </div>
        <div className="flex my-2 md:hidden  lg:my-0 justify-between  w-full  lg:col-span-1 ">
          <Link
            href={`/accounts/${txn?.from}`}
            className="lg:text-end text-primary"
          >
            From : {accountDetails?.name || formatAddress(txn?.from)}
          </Link>
          <p className=" text-end">{feeEth} ETH</p>
        </div>
      </div>
    </>
  );
};
