import React, { useMemo } from "react";
import { Box, NotepadText } from "lucide-react";
import { BLOB_BLOCKS_TOP_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";
type Props = {};

function Blocks({}: Props) {
  const { data } = useQuery(BLOB_BLOCKS_TOP_QUERY);

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Blocks</p>
      </div>
      <div className="px-4  ">
        {data?.blobBlockDatas?.map((blk: any) => {
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
    <div className="flex justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
          <Box strokeWidth="1" width={24} height={24} />
        </div>
        <div>
          <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
            {blockNumber}
          </Link>

          <p>{new Date().toLocaleString()}</p>
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
