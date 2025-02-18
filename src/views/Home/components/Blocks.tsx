import React, { useMemo } from "react";
import { Box, NotepadText } from "lucide-react";
import { BLOB_BLOCKS_TOP_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";
import { timeAgo } from "@/lib/time";
type Props = {};

function Blocks({}: Props) {
  const { data, loading } = useQuery(BLOB_BLOCKS_TOP_QUERY, {
    pollInterval: 15_000, // Every 15 sec
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Blocks</p>
      </div>
      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return <BlocksRowSkeleton key={`BlocksRowSkeleton${idx}`} />;
          })}
        {!loading &&
          data?.blobBlockDatas?.map((blk: any) => {
            return <BlocksRow key={blk?.id} blk={blk} />;
          })}
        {/* <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow />
        <BlocksRow /> */}
      </div>
      <Link
        href={"/blocks"}
        className="flex px-4 py-2 border-t border-base-200 justify-center"
      >
        <p className="btn btn-ghost btn-sm">View more blocks</p>
      </Link>
    </div>
  );
}

export default Blocks;

const BlocksRow = ({ blk }: any) => {
  //  id;
  //  blockNumber;
  //  totalBlobTransactionCount;
  //  totalTransactionCount;
  //  totalFeeEth;
  //  totalBlobGasEth;
  //  totalBlobAccounts;
  //  size;
  //  timestamp;
  // const totalBlobHashesCount = useMemo(() => {
  //   return formatBytes(Number(blk?.totalBlobHashesCount));
  // }, [blk?.totalBlobHashesCount]);
  // const totalBlobHashesCount = useMemo(() => {
  //   return totalBlobHashesCount;
  // }, [blk?.totalBlobHashesCount]);
  const feeEth = useMemo(() => {
    return new BigNumber(blk?.totalFeeEth).div(1e18).toFormat(4);
  }, [blk?.totalFeeEth]);
  const blockNumber = useMemo(() => {
    return new BigNumber(blk?.blockNumber).toFormat(0);
  }, [blk?.blockNumber]);

  const blobSize = useMemo(() => {
    return formatBytes(Number(blk?.totalBlobGas));
  }, [blk?.totalBlobGas]);

  return (
    <div className="flex flex-wrap gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
          <Box strokeWidth="1" width={24} height={24} />
        </div>
        <div>
          <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
            {blockNumber}
          </Link>

          <p>{timeAgo(new Date(Number(blk?.timestamp) * 1000))} </p>
        </div>
      </div>
      <div>
        <p>{blobSize}</p>
        <p>{blk?.totalBlobHashesCount} blobs</p>
      </div>
      <div>
        <p>{blk?.totalTransactionCount} transactions</p>
      </div>
    </div>
  );
};
const BlocksRowSkeleton = () => {
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
