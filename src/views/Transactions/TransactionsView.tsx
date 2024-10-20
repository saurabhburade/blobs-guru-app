"use client";
import Header from "@/components/Header/Header";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
  COLLECTIVE_STAT_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { Box, Database, NotepadText } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import BlobTransactionDayChart from "../Home/components/BlobTransactionDayChart";
import BlobSizeDayChart from "./components/BlobSizeDayChart";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { useTransactionsExplorerWithRPCData } from "@/hooks/useTransactionsData";
import { timeAgo } from "@/lib/time";

type Props = {};

function TransactionsView({}: Props) {
  // const { data } = useQuery(BLOB_TRANSACTIONS_EXPLORER_QUERY);

  return (
    <div>
      <Header />
      <div className="mx-auto lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="w-full ">
          <div className="lg:h-[20em]  flex lg:flex-nowrap flex-wrap items-stretch gap-4 my-4">
            <div className="p-5 h-[20em] bg-base-100/50 border   border-base-300/20 w-full rounded-lg">
              <BlobTransactionDayChart />
            </div>
            <div className="p-5 h-[20em] bg-base-100/50 border border-base-300/20 w-full  rounded-lg">
              {/* <BlobTransactionDayChart /> */}
              <BlobSizeDayChart />
            </div>
          </div>
          <TxnStats />
        </div>
        <TxnRows />
      </div>
    </div>
  );
}

export default TransactionsView;

const LIMIT_PER_PAGE = 10;
const TxnStats = () => {
  const { data, loading } = useQuery(COLLECTIVE_STAT_QUERY);

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
  if (loading) {
    return (
      <div className=" h-fit ">
        <div className="h-fit  grid lg:grid-cols-4 gap-4">
          {new Array(4).fill(1).map((num, idx) => {
            return (
              <div
                key={`BlocksCubes_skeleton_${idx}`}
                className="border-base-300/50 space-y-3 border w-full h-full rounded-lg p-5 bg-base-100/50"
              >
                <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>

                <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[12em] lg:w-[10em] h-[22px] animate-pulse"></div>
                <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[15em] lg:w-[12em]  lg:w-[8em] h-[22px] animate-pulse"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className=" h-fit ">
      <div className="h-fit  grid lg:grid-cols-4 gap-4">
        <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-100/50">
          <img
            src="/images/logox.jpeg"
            className="rounded-lg"
            width={40}
            height={40}
            alt=""
          />
          <p className=""> Total Blobs</p>
          <p className="text-3xl font-bold"> {totalBlobHashesCount}</p>
        </div>
        <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-100/50">
          <NotepadText strokeWidth="1" width={40} height={40} />
          <p className=""> Total Blob Transactions</p>
          <p className="text-3xl font-bold"> {totalBlobTransactionCount}</p>
        </div>
        <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-100/50">
          <img src="/images/icons/eth.svg" width={28} height={28} alt="" />
          <p className=""> Total Fees</p>
          <p className="text-3xl font-bold"> {totalFeesEth}</p>
        </div>

        <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-100/50">
          <Database strokeWidth="1" width={40} height={40} />

          <p className=""> Total Data</p>
          <p className="text-3xl font-bold"> {dataSize}</p>
        </div>
      </div>
    </div>
  );
};
function TxnRows({}: Props) {
  const [page, setPage] = useState(1);
  const { data, loading } = useTransactionsExplorerWithRPCData({ page });

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
                key={`TransactionRowSkeleton_TRANSACTIONS_${idx}`}
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
              <Link href={`/blocks/${txn?.from}`} className="text-primary">{txn?.blockNumber}</Link>{" "}
            </span>{" "}
            : {txn?.index}
          </p>
        </div>

        <div>
          <p>{feeEth} ETH</p>
        </div>
        {blobFeeGwei && !isNaN(Number(blobFeeGwei)) ? (
          <div className="">
            <p>{blobFeeGwei} GWEI</p>
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
