"use client";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { NotepadText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { apolloClient } from "@/lib/apollo/client";
import {
  ETHEREUM_ACCOUNT_CAPABILITIES_QUERY,
  ETHEREUM_ACCOUNT_SINGLE_QUERY,
  ETHEREUM_ACCOUNT_SINGLE_QUERY_V2,
  ETHEREUM_USER_TRANSACTIONS_EXACT_FEES_QUERY,
  ETHEREUM_USER_TRANSACTIONS_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesEthereum";
import { timeAgo } from "@/lib/time";
import { formatAddress, formatBytes, parseEthHashString } from "@/lib/utils";
import PoweredBy from "../Home/components/PoweredBy";
import L2BeatCard from "./Apps/AppStats/L2Beat/L2BeatCard";
import AccountStatCard from "./components/AccountStats/AccountStatCard";
import AccountStats from "./components/AccountStats/AccountStats";

type Props = {
  account: string;
};
const SKELETON_ROW_KEYS = [
  "row-0",
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
  "row-7",
  "row-8",
  "row-9",
];

type SchemaType = { fields: { name: string }[] } | null | undefined;
type AccountTransaction = {
  id: string;
  hash: string;
  timestamp: string;
  signerId: string;
  nEvents: number;
  totalBytes: number;
  blobFeeWei?: string | null;
  totalDAFeeNatve: number | null;
};

function hasFields(type: SchemaType, names: string[]) {
  return names.every((name) =>
    type?.fields.some((field) => field.name === name),
  );
}

function SingleAccount({ account }: Props) {
  const { data: capabilities } = useQuery(ETHEREUM_ACCOUNT_CAPABILITIES_QUERY, {
    client: apolloClient,
  });
  const exactAccountFeesSupported = hasFields(capabilities?.account, [
    "executionFeesWei",
    "blobFeesWei",
  ]);
  const { data, loading, error, refetch } = useQuery(
    exactAccountFeesSupported
      ? ETHEREUM_ACCOUNT_SINGLE_QUERY_V2
      : ETHEREUM_ACCOUNT_SINGLE_QUERY,
    {
      variables: {
        id: account,
      },
      client: apolloClient,
      notifyOnNetworkStatusChange: true,
    },
  );
  const indexedAccount = data?.accountEntities?.nodes?.[0];

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
        {error && (
          <div className="alert alert-error" role="alert">
            <p>Unable to load this account. Please try again.</p>
            <button
              type="button"
              className="btn btn-sm"
              disabled={loading}
              onClick={() => void refetch().catch(() => {})}
            >
              Retry
            </button>
          </div>
        )}
        {(indexedAccount || loading) && (
          <>
            <div className="w-full space-y-4 ">
              <L2BeatCard account={indexedAccount?.id ?? account} />
              <div className="">
                <AccountStatCard acc={indexedAccount} isLoading={loading} />
              </div>
            </div>
            {indexedAccount && (
              <>
                <AccountStats account={indexedAccount.id} />
                <TxnRows
                  key={indexedAccount.id}
                  account={indexedAccount.id}
                  exactFeesSupported={hasFields(capabilities?.transaction, [
                    "blobFeeWei",
                  ])}
                />
              </>
            )}
          </>
        )}
        {!loading && !error && !indexedAccount && (
          <div
            className="rounded-lg border border-base-200 p-5 space-y-3"
            role="status"
          >
            <p>No indexed blob transactions found for this account.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => void refetch().catch(() => {})}
            >
              Refresh
            </button>
          </div>
        )}
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default SingleAccount;
const LIMIT_PER_PAGE = 10;
function TxnRows({
  account,
  exactFeesSupported,
}: {
  account: string;
  exactFeesSupported: boolean;
}) {
  const [page, setPage] = useState(1);
  const {
    data: daData,
    loading,
    error,
    refetch,
  } = useQuery(
    exactFeesSupported
      ? ETHEREUM_USER_TRANSACTIONS_EXACT_FEES_QUERY
      : ETHEREUM_USER_TRANSACTIONS_FILTER_LIMIT_QUERY,
    {
      variables: {
        signerId: account,
        skip: LIMIT_PER_PAGE * (page - 1),
        limit: LIMIT_PER_PAGE,
      },
      client: apolloClient,
      notifyOnNetworkStatusChange: true,
    },
  );
  const transactions = daData?.transactionData?.nodes ?? [];

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
        {error && (
          <div className="alert alert-error my-4" role="alert">
            <p>Unable to load transactions. Please try again.</p>
            <button
              type="button"
              className="btn btn-sm"
              disabled={loading}
              onClick={() => void refetch().catch(() => {})}
            >
              Retry transactions
            </button>
          </div>
        )}
        {loading &&
          SKELETON_ROW_KEYS.map((key) => {
            return <TransactionRowSkeleton key={key} />;
          })}
        {!loading && !error && transactions.length === 0 && (
          <p className="py-4" role="status">
            No transactions found.
          </p>
        )}
        {!loading &&
          !error &&
          transactions.map((txn: AccountTransaction) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
      </div>
      <div className="flex px-4 justify-end gap-2  p-4  border-t border-base-200">
        {page > 1 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={loading}
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
          type="button"
          className="btn btn-outline btn-sm"
          disabled={loading || !!error || transactions.length < LIMIT_PER_PAGE}
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

const TransactionRow = ({ txn }: { txn: AccountTransaction }) => {
  const daFee = useMemo(() => {
    return new BigNumber(txn?.blobFeeWei ?? txn?.totalDAFeeNatve ?? 0)
      .div(1e18)
      .toFormat();
  }, [txn?.blobFeeWei, txn?.totalDAFeeNatve]);

  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-5 py-4 border-b border-base-200 text-sm items-center text-end">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link
              href={`/ethereum/txn/${parseEthHashString(txn?.hash)}`}
              className="text-primary"
            >
              {" "}
              {formatAddress(parseEthHashString(txn?.hash))}
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
          <p>{daFee} ETH</p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link
              href={`/ethereum/txn/${parseEthHashString(txn?.hash)}`}
              className="text-primary"
            >
              {" "}
              {formatAddress(parseEthHashString(txn?.hash))}
            </Link>
            <p>{timeAgo(new Date(Number(txn.timestamp)))}</p>
          </div>
        </div>
        <div>
          <p>{formatBytes(txn?.totalBytes || 0)} </p>
        </div>
        <div className="hidden  md:block xl:hidden text-end">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">DA fee: {daFee} ETH</p>
        </div>
        <div className="flex my-2 md:hidden  lg:my-0 justify-between  w-full  lg:col-span-1 ">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">DA fee: {daFee} ETH</p>
        </div>
      </div>
    </>
  );
};
