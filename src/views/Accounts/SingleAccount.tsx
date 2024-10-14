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
import { formatAddress, formatBytes } from "@/lib/utils";
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
    <div>
      <Header />
      <div className="mx-auto p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="w-full space-y-4 ">
          <L2BeatCard account={account} />
          <AccountStatCard acc={data?.account} isLoading={loading} />
          <div className="lg:h-[20em] flex-wrap lg:flex-nowrap flex items-stretch gap-4 my-4">
            <div className="p-5 bg-base-100/50 border   border-base-300/20 w-full h-[20em] rounded-lg">
              <DayTxnsBlobAccountChart account={account} />
            </div>
            <div className="p-5 bg-base-100/50 border border-base-300/20 w-full h-[20em] rounded-lg">
              {/* <BlobTransactionDayChart /> */}
              <DayHashesBlobAccountChart account={account} />
            </div>
          </div>
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
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_ACCOUNT_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      account,
    },
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Transactions</p>
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
          data?.blobTransactions?.map((txn: any) => {
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_0.5fr_1.5fr] items-center lg:flex-nowrap first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2">
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
          <p>{txn?.blobHashesLength} blob</p>
        </div>
      </div>
      <div className="text-end">
        <p>{totalBlobSize}</p>
        <p>{blobGasEth} ETH</p>
      </div>
      <div className="flex my-2  lg:my-0 justify-between  w-full lg:flex-col lg:col-span-1 col-span-2">
        <Link
          href={`/accounts/${txn?.from}`}
          className="lg:text-end text-primary"
        >
          From : {accountDetails?.name || formatAddress(txn?.from)}
        </Link>
        <p className=" text-end">{feeEth} ETH</p>
      </div>
    </div>
  );
};
