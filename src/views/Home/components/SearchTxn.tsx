import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { BLOB_TRANSACTION_QUERY } from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { NotepadText } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { isHex } from "viem";

type Props = {};

function SearchTxn({}: Props) {
  const [txHash, setTxHash] = useState("");
  const [hash, setHash] = useState("");

  const { data, loading } = useQuery(BLOB_TRANSACTION_QUERY, {
    variables: {
      hash: hash,
    },
  });
  console.log(`🚀 ~ file: SearchTxn.tsx:16 ~ data:`, data);
  return (
    <div className="dropdown   w-full">
      <div tabIndex={0} role="button" className=" w-full">
        <div className="join  w-full">
          <input
            className="input w-full input-bordered outline-none active:outline-none  focus:outline-none join-item lg:w-1/3 "
            placeholder="Search transactions"
            value={txHash}
            onChange={(e) => {
              const v = e.target.value;
              if (v?.length <= 66) {
                setTxHash(v);
              }
              if (v?.length === 66) {
                if (isHex(v)) {
                  setHash(v);
                }
              } else {
                setHash("");
              }
            }}
          />
          <button className="btn join-item rounded-r-full">Search</button>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] lg:w-1/3 p-2 shadow border border-base-200"
      >
        {!loading && data?.blobTransaction && (
          <li>
            <Link
              href={`/transactions/${hash}`}
              className="w-full hover:!bg-transparent"
            >
              <TransactionRow txn={data?.blobTransaction} />
            </Link>
          </li>
        )}
        {!loading && !data?.blobTransaction && (
          <li>
            <div className="p-5 hover:!bg-transparent">
              Not a blob transaction
            </div>
          </li>
        )}
        {loading && (
          <li className="hover:!bg-transparent">
            <div className="w-full hover:!bg-transparent">
              <TransactionRowSkeleton />
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export default SearchTxn;
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
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.5fr] items-center lg:flex-nowrap first:border-t-0 border-t  border-base-200 text-sm">
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
