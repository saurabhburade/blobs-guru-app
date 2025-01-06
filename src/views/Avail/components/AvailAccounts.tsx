import ImageWithFallback from "@/components/ImageWithFallback";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_ACCOUNTS_LIMIT_QUERY } from "@/lib/apollo/queriesAvail";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useMemo } from "react";

type Props = {};
const LIMIT_PER_PAGE = 10;
function AvailAccounts({}: Props) {
  const [page, setPage] = useState(1);
  const { data: rawData, loading: statsLoading } = useQuery(
    AVAIL_ACCOUNTS_LIMIT_QUERY,
    {
      client: availClient,
      variables: {
        skip: LIMIT_PER_PAGE * (page - 1),
        limit: LIMIT_PER_PAGE,
      },
    }
  );

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="hidden xl:grid xl:grid-cols-6 py-4 px-4  border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 col-span-2 ">Address</div>

        <p>Size</p>
        <p>Data Subs</p>
        <p>Transactions</p>
        <p>Fees</p>
      </div>
      <div className="px-4 ">
        {statsLoading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton
                key={`TransactionRowSkeleton_ACCOUNTS_${idx}`}
              />
            );
          })}
        {rawData?.accountEntities?.nodes?.map((acc: any) => {
          return <AccountRow acc={acc} key={acc?.id} />;
        })}
      </div>
      {rawData?.accountEntities?.totalCount > LIMIT_PER_PAGE && (
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

export default AvailAccounts;
//   totalByteSize;
//   totalFees;
//   totalExtrinsicCount;
//   totalDAFees;
//   endBlock;
//   startBlock;
//   totalDataSubmissionCount;
//   totalFeesUSD;
//   totalDAFeesUSD;
const AccountRow = ({ acc }: any) => {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalSize = useMemo(() => {
    return formatBytes(Number(acc?.totalByteSize));
  }, [acc?.totalByteSize]);
  const totalFees = useMemo(() => {
    return new BigNumber(acc?.totalFees).toFormat(4);
  }, [acc?.totalFees]);
  const totalFeesUSD = useMemo(() => {
    return new BigNumber(acc?.totalFeesUSD).toFormat(4);
  }, [acc?.totalFeesUSD]);
  const totalExtrinsicCount = useMemo(() => {
    return new BigNumber(acc?.totalExtrinsicCount).toFormat();
  }, [acc?.totalExtrinsicCount]);
  const totalDAFees = useMemo(() => {
    return new BigNumber(acc?.totalDAFees).toFormat(4);
  }, [acc?.totalDAFees]);
  const totalDataSubmissionCount = useMemo(() => {
    return new BigNumber(acc?.totalDataSubmissionCount).toFormat();
  }, [acc?.totalDataSubmissionCount]);
  const totalBlobGasEth = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasEth).div(1e18).toFormat(4);
  }, [acc?.totalBlobGasEth]);
  const totalBlobGasEthUSD = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasUSD).div(1e18).toFormat(0);
  }, [acc?.totalBlobGasUSD]);
  const totalFeeEth = useMemo(() => {
    return new BigNumber(acc?.totalFeeEth).div(1e18).toFormat(4);
  }, [acc?.totalFeeEth]);
  const blobsPerBlock = useMemo(() => {
    return new BigNumber(Number(acc?.totalBlobHashesCount))
      .div(Number(acc?.totalBlobBlocks))
      .toFormat(4);
  }, [acc?.totalBlobHashesCount, acc?.totalBlobBlocks]);
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-6 py-4 last:border-b-0 border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 col-span-2 ">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <ImageWithFallback
              src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
          </div>
          <Link
            className="text-primary hidden lg:block"
            href={`/avail/${acc?.id}`}
          >
            {formatAddress(acc?.id)}
          </Link>
        </div>

        <div>
          <p>{totalSize}</p>
        </div>
        <div>
          <p>{totalDataSubmissionCount}</p>
        </div>

        <div>
          <p>{totalExtrinsicCount}</p>
        </div>

        <div>
          <p>{totalFees} AVAIL</p>
          <p>${totalFeesUSD}</p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
              <ImageWithFallback
                src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
                className="rounded-lg "
                width={24}
                height={24}
                alt=""
              />
            </div>

            <Link className="text-primary " href={`/avail/${acc?.id}`}>
              {formatAddress(acc?.id)}
            </Link>
          </div>
          <div className="text-end">
            <p>{totalSize}</p>
          </div>
        </div>
      </div>
    </>
  );
};
