import React, { useMemo } from "react";
import { NotepadText } from "lucide-react";
import { useQuery } from "@apollo/client";
import { BLOB_TRANSACTIONS_TOP_QUERY } from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import Link from "next/link";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
type Props = {};

function Transactions({}: Props) {
  const { data, loading } = useQuery(BLOB_TRANSACTIONS_TOP_QUERY);
  console.log(`🚀 ~ file: Transactions.tsx:9 ~ data:`, data?.blobTransactions);
  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Transactions</p>
      </div>
      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton key={`TransactionRowSkeleton__${idx}`} />
            );
          })}
        {!loading &&
          data?.blobTransactions?.map((txn: any) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
      </div>
      <Link
        href={"/transactions"}
        className="flex px-4 py-2 border-t border-base-200 justify-center"
      >
        <p className="btn btn-ghost btn-sm">View more transactions</p>
      </Link>
    </div>
  );
}

export default Transactions;

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
const TransactionRowSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_0.5fr_1.5fr] items-center lg:flex-nowrap first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2 w-full">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[4em] h-[4em] animate-pulse"></div>
        <div className="space-y-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] lg:w-[10em] h-[20px] animate-pulse"></div>
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em]  lg:w-[8em] h-[20px] animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 w-full flex items-end flex-col justify-end ">
        <div className=" bg-base-200/50 flex justify-end rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>

        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>
      </div>
      <div className="flex my-2  gap-2 lg:my-0 justify-between items-start  lg:items-end  w-full lg:flex-col lg:col-span-1 col-span-2">
        <div className=" bg-base-200/50 flex justify-end rounded-xl items-center w-[10em] lg:w-[5em] h-[20px] animate-pulse"></div>

        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[8em] h-[20px] animate-pulse"></div>
      </div>
    </div>
  );
};
