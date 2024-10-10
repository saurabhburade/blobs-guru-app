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
type Props = {
  blockNumber: number | string;
  totalBlobTxns: number;
};

const LIMIT_PER_PAGE = 10;

function BlockTransactions({ blockNumber, totalBlobTxns }: Props) {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_FOR_BLOCK, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      blockNumber,
    },
  });
  const totalPages = useMemo(() => {
    return totalBlobTxns / LIMIT_PER_PAGE;
  }, [totalBlobTxns]);
  console.log(`🚀 ~ file: BlockTransactions.tsx:27 ~ data:`, data);
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
                key={`TransactionRowSkeleton_Block_Txns_${idx}`}
              />
            );
          })}
        {!loading &&
          data?.blobTransactions?.map((txn: any) => {
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
        <p className="lg:text-end">
          From : {accountDetails?.name || formatAddress(txn?.from)}
        </p>
        <p className=" text-end">{feeEth} ETH</p>
      </div>
    </div>
  );
};
