import React, { useMemo, useState } from "react";
import { NotepadText } from "lucide-react";
import { useQuery } from "@apollo/client";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_TRANSACTIONS_FOR_BLOCK,
  BLOB_TRANSACTIONS_TOP_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import Link from "next/link";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { timeAgo } from "@/lib/time";
import { useBlockTransactionsWithRPCData } from "@/hooks/useTransactionsData";
type Props = {
  blockNumber: number | string;
  totalBlobTxns: number;
};

const LIMIT_PER_PAGE = 10;

function BlockTransactions({ blockNumber, totalBlobTxns }: Props) {
  const [page, setPage] = useState(1);
  const { data, loading } = useBlockTransactionsWithRPCData({
    blockNumber: Number(blockNumber),
    page,
  });
  const totalPages = useMemo(() => {
    return totalBlobTxns / LIMIT_PER_PAGE;
  }, [totalBlobTxns]);

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
                key={`TransactionRowSkeleton_Block_Txns_${idx}`}
              />
            );
          })}
        {!loading &&
          data?.map((txn: any) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
      </div>
      {totalPages > 1 && (
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
      )}
    </div>
  );
}

export default BlockTransactions;

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
