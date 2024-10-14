"use client";
import Header from "@/components/Header/Header";
import {
  BLOB_ACCOUNTS_EXPLORER_QUERY,
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
  COLLECTIVE_STAT_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
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
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";

type Props = {};

function AccountsView({}: Props) {
  // const { data } = useQuery(BLOB_TRANSACTIONS_EXPLORER_QUERY);

  return (
    <div>
      <Header />
      <div className="mx-auto lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="w-full space-y-4 ">
          <div className="lg:h-[20em]  flex-wrap lg:flex-nowrap flex items-stretch gap-4 my-4">
            <div className="p-5 h-[20em] bg-base-100/50 border   border-base-300/20 w-full rounded-lg">
              <TopBlobAccountsChart />
            </div>
            <div className="p-5  h-[20em] bg-base-100/50 border border-base-300/20 w-full  rounded-lg">
              {/* <BlobTransactionDayChart /> */}
              <BlobHashesDayChart />
            </div>
          </div>
          <TopAccountsStats />
          <TxnStats />
        </div>
        <AccountRows />
      </div>
    </div>
  );
}

export default AccountsView;

const LIMIT_PER_PAGE = 10;
const TxnStats = () => {
  const { data, loading } = useQuery(COLLECTIVE_STAT_QUERY);
  console.log(`🚀 ~ file: Home.tsx:39 ~ data:`, data?.collectiveData);
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
          <User strokeWidth="1" width={40} height={40} />
          <p className=""> Total Blob Accounts</p>
          <p className="text-3xl font-bold"> {totalBlobAccounts}</p>
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
const TopAccountsStats = () => {
  const { data } = useQuery(TOP_FIVE_BLOB_ACCOUNTS_QUERY);
  console.log(`🚀 ~ file: BlobSizeDayChart.tsx:63 ~ data:`, data);
  const chartData = useMemo(() => {
    const datas = data?.accounts?.map((bd: any) => {
      const totalFeeEth = new BigNumber(bd?.totalFeeEth).div(1e18).toFormat(2);
      const lastUpdatedBlock = new BigNumber(bd?.lastUpdatedBlock).toFormat(0);
      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        size: formatBytes(Number(bd?.totalBlobGas)),
        totalFeeEth,
        lastUpdatedBlock,
      };
    });
    return datas;
  }, [data?.accounts]);

  return (
    <div className=" h-fit ">
      <div className="h-fit  grid lg:grid-cols-2 gap-4">
        {data?.accounts?.map((acc: any) => {
          return <AccountStatCard key={acc?.id} acc={acc} />;
        })}
      </div>
    </div>
  );
};
function AccountRows({}: Props) {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery(BLOB_ACCOUNTS_EXPLORER_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
    },
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Accounts</p>
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

const AccountRow = ({ acc }: any) => {
  //  id;
  //  totalBlobTransactionCount;
  //  totalBlobGas;
  //  lastUpdatedBlock;
  //  totalBlobTransactionCount;
  //  totalBlobGasEth;
  //  totalBlobHashesCount;
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalBlobGas));
  }, [acc?.totalBlobGas]);
  const totalBlobGasEth = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasEth).div(1e18).toFormat(4);
  }, [acc?.totalBlobGasEth]);
  const totalFeeEth = useMemo(() => {
    return new BigNumber(acc?.totalFeeEth).div(1e18).toFormat(4);
  }, [acc?.totalFeeEth]);
  return (
    <div className="flex justify-between flex-wrap gap-4 first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2 ">
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
            <User strokeWidth="1" width={24} height={24} />
          )}
        </div>
        <div>
          {accountDetails?.name ? (
            <div>
              <p>{accountDetails?.name}</p>
              <Link
                className="text-primary hidden lg:block"
                href={`/accounts/${acc?.id}`}
              >
                {acc?.id}
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
                {acc?.id}
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
      <div>
        <p>{totalBlobSize}</p>
        <p>{totalBlobGasEth} ETH</p>
      </div>
      <div>
        {/* <p>From : {formatAddress(acc?.from)}</p> */}
        <p>{new BigNumber(acc?.totalBlobHashesCount)?.toFormat(0)} blobs</p>
      </div>
    </div>
  );
};
