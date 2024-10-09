"use client";
import Header from "@/components/Header/Header";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  COLLECTIVE_STAT_QUERY,
} from "@/lib/apollo/queries";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { Box, Database } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

type Props = {};

function Blocks({}: Props) {
  const { data: topBlocks } = useQuery(BLOB_BLOCKS_TOP_FIVE_QUERY);
  const { data } = useQuery(COLLECTIVE_STAT_QUERY);
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

  return (
    <div>
      <Header />
      <div className="mx-auto p-20 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className=" h-[10em] grid grid-cols-4 gap-10 ">
          <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-200/20">
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
          <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-200/20">
            <Box strokeWidth="1" width={40} height={40} />
            <p className=""> Total Blob Blocks</p>
            <p className="text-3xl font-bold"> {totalBlobBlocks}</p>
          </div>
          <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-200/20">
            <img src="/images/icons/eth.svg" width={28} height={28} alt="" />
            <p className=""> Total Fees</p>
            <p className="text-3xl font-bold"> {totalFeesEth}</p>
          </div>

          <div className="border-base-300/50 space-y-2 border w-full h-full rounded-lg p-5 bg-base-200/20">
            <Database strokeWidth="1" width={40} height={40} />

            <p className=""> Total Data</p>
            <p className="text-3xl font-bold"> {dataSize}</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-10 h-[10em] my-4">
          {topBlocks?.blobBlockDatas?.map((blk: any) => {
            return <BlocksCube key={blk?.id} blk={blk} />;
          })}
        </div>
        <BlocksRows />
      </div>
    </div>
  );
}

export default Blocks;
const BlocksCube = ({ blk }: any) => {
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
    <div>
      <div className="w-full space-y-3 bg-base-100 shadow-[-10px_-10px] p-4 rounded-lg shadow-base-200 border border-base-200">
        <Link
          className="text-primary text-2xl font-bold"
          href={`/blocks/${blk?.blockNumber}`}
        >
          {blockNumber}
        </Link>
        <div className="text-sm ">
          <p>{blobSize}</p>
          <p>{blk?.totalBlobHashesCount} blobs</p>
          <p>{feeEth} ETH</p>
        </div>
        <p className="text-xs">
          {new Date(Number(blk?.timestamp) * 1000).toLocaleString()}
        </p>
      </div>
      <div className="text-center opacity-60"></div>
    </div>
  );
};
const LIMIT_PER_PAGE = 10;
function BlocksRows({}: Props) {
  const [page, setPage] = useState(1);
  const { data } = useQuery(BLOB_BLOCKS_EXPLORER_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
    },
  });

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
