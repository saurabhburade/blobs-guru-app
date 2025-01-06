import ImageWithFallback from "@/components/ImageWithFallback";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useAvailBlocks } from "@/hooks/useAvailBlocks";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_ACCOUNTS_LIMIT_QUERY } from "@/lib/apollo/queriesAvail";
import { timeAgo } from "@/lib/time";
import { formatAddress, formatBytes, formatEthereumValue } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { Box } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useMemo } from "react";

type Props = {};
const LIMIT_PER_PAGE = 10;
function AvailBlocksList({}: Props) {
  const [page, setPage] = useState(1);
  const { data: rawData, loading: blocksLoading } = useAvailBlocks({ page });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="hidden xl:grid xl:grid-cols-7 py-4 px-4  border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 col-span-2 ">Block</div>

        <p>Size</p>

        <p>Data Subs</p>
        <p>Ext</p>
        <p>Events</p>
        <p>Fees</p>
      </div>
      <div className="px-4 ">
        {blocksLoading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton
                key={`TransactionRowSkeleton_ACCOUNTS_${idx}`}
              />
            );
          })}
        {rawData?.map((blk: any) => {
          return <BlocksRow blk={blk} key={blk?.id} />;
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

export default AvailBlocksList;

const BlocksRow = ({ blk }: any) => {
  // blockFee: 0;
  // byteSize: "0";
  // id: "561904";
  // nbEvents: 2;
  // nbExtrinsics: 2;
  // timestamp: "2024-11-11T11:02:40";
  // __typename: "DataSubmissionSumAggregates";
  const feeEth = useMemo(() => {
    return new BigNumber(blk?.totalFeeEth).div(1e18).toFormat(4);
  }, [blk?.totalFeeEth]);
  const blobFeeGwei = useMemo(() => {
    return new BigNumber(blk?.totalBlobGasEth).div(1e9).toFormat(5);
  }, [blk?.totalBlobGasEth]);
  const blockNumber = useMemo(() => {
    return new BigNumber(blk?.id).toFormat(0);
  }, [blk?.blockNumber]);

  const blobSize = useMemo(() => {
    return formatBytes(Number(blk?.totalBlobGas));
  }, [blk?.totalBlobGas]);
  const blockSize = useMemo(() => {
    return formatBytes(Number(blk?.byteSize));
  }, [blk?.totalBlobGas]);
  const ethBurn = useMemo(() => {
    return new BigNumber(blk?.rpcData?.data?.baseFeePerGas)
      .multipliedBy(Number(blk?.rpcData?.data?.gasUsed))
      .div(1e18)
      .toFormat(5);
  }, [blk?.rpcData]);
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 border-b border-base-200 text-sm items-center">
        <div className="flex items-center gap-2 text-start col-span-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <Box strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            {/* <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
              {blockNumber}
            </Link> */}
            <p>{blockNumber}</p>
            <p>{timeAgo(blk?.timestamp)}</p>
          </div>
        </div>

        <div>
          <p>{blockSize}</p>
        </div>
        <div>
          <p>{blk?.distinctCount?.id}</p>
        </div>
        <div>
          <p>{blk?.nbExtrinsics} </p>
        </div>
        <div>
          <p>{blk?.nbEvents} </p>
        </div>

        <div>
          <p>{Number(blk?.blockFee)?.toFixed(4)} AVAIL</p>
        </div>
      </div>
      <div className="flex flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <Box strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            {/* <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
              {blockNumber}
            </Link> */}
            <p>{blockNumber}</p>

            <p>{timeAgo(blk.timestamp)}</p>
          </div>
        </div>
        <div>
          <p>{blockSize}</p>
          <p>{blk?.distinctCount?.id} DA subs</p>
        </div>
        <div className="text-end">
          <p>{Number(blk?.blockFee)?.toFixed(4)} AVAIL</p>
          <p className="text-xs opacity-70">
            {" "}
            ${new BigNumber(blk?.blockFee)
              ?.times(blk?.availPrice)
              .toFormat(2)}{" "}
          </p>
        </div>
      </div>
    </>
  );
};
