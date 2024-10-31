"use client";
import Header from "@/components/Header/Header";
import BlocksRowSkeleton from "@/components/Skeletons/BlocksRowSkeleton";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  COLLECTIVE_STAT_QUERY,
} from "@/lib/apollo/queries";
import {
  cn,
  formatAddress,
  formatBytes,
  formatEthereumValue,
} from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { Box, Database } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import BlobEthFeeChart from "./components/BlobEthFeeChart";
import BlobBlocksChart from "./components/BlobBlocksChart";
import BlobPerBlocksChart from "./components/BlobPerBlocksChart";
import { useClient, usePublicClient } from "wagmi";
import { formatGwei, hexToBigInt } from "viem";
import { useBlocksExplorerWithRPCData } from "@/hooks/useBlocksData";
import { timeAgo } from "@/lib/time";
import RecentBlocksChart from "./components/RecentBlocksChart";
import ETHPriceDayChart from "../Stats/components/ETHPriceDayChart";

type Props = {};

function Blocks({}: Props) {
  return (
    <div>
      <Header />
      <div className="mx-auto p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-2 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        {/* <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200/50 border">
          <RecentBlocksChart duration={90} />
        </div> */}
        <div className="grid lg:grid-cols-2 lg:h-[20em] gap-2">
          <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200/50 border">
            {/* <HeatMap /> */}
            <ETHPriceDayChart duration={90} />
          </div>

          <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200/50 border">
            <RecentBlocksChart duration={90} />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 lg:h-[20em] gap-2">
          <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200/50 border">
            <BlobBlocksChart duration={15} />
          </div>

          <div className=" p-5 h-[20em] bg-base-100 rounded-lg border-base-200/50 border">
            <BlobPerBlocksChart duration={15} />
          </div>
        </div>
        {/* <BlockStats /> */}
        {/* <BlocksCubes /> */}
        <BlocksRows />
      </div>
    </div>
  );
}

export default Blocks;
// const HeatMap = () => {
//   return (
//     <div className="w-full h-full">
//       <div className="grid gap-2 grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-7 ">
//         {new Array(180).fill(1).map((v, idx) => {
//           const randomOpacity = Math.floor(Math.random() * 101);
//           return (
//             <p
//               className={cn("w-5 h-5 bg-primary rounded-lg")}
//               style={{
//                 opacity: `${randomOpacity}%`,
//               }}
//               key={`DUMMY_HEAT_${idx}`}
//             >
//               {idx}
//             </p>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
const BlockStats = () => {
  const { data, loading } = useQuery(COLLECTIVE_STAT_QUERY);

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
      <div className=" lg:h-[10em] grid lg:grid-cols-4 gap-4 lg:gap-10 ">
        {new Array(4).fill(1).map((num, idx) => {
          return (
            <div
              key={`BlockStats_skeleton_${idx}`}
              className="border-base-300/50 space-y-3 border w-full h-full rounded-lg p-5 bg-base-100/50"
            >
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>

              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[5em] lg:w-[10em] h-[22px] animate-pulse"></div>
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[15em] lg:w-[5em]  lg:w-[8em] h-[22px] animate-pulse"></div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className=" lg:h-[10em] grid lg:grid-cols-4 gap-4 lg:gap-10 ">
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
        <Box strokeWidth="1" width={40} height={40} />
        <p className=""> Total Blob Blocks</p>
        <p className="text-3xl font-bold"> {totalBlobBlocks}</p>
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
  );
};
const BlocksCubes = () => {
  const { data: topBlocks, loading } = useQuery(BLOB_BLOCKS_TOP_FIVE_QUERY);
  if (loading) {
    return (
      <div className="grid lg:grid-cols-5 gap-4 lg:gap-10 lg:h-[10em] my-4">
        {new Array(5).fill(1).map((num, idx) => {
          return (
            <div
              key={`BlocksCubes_skeleton_${idx}`}
              className="border-base-300/50 space-y-3 border w-full h-full rounded-lg p-5 bg-base-100/50"
            >
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>

              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[5em] lg:w-[10em] h-[22px] animate-pulse"></div>
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[15em] lg:w-[5em]  lg:w-[8em] h-[22px] animate-pulse"></div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid lg:grid-cols-5 gap-4 lg:gap-10 lg:h-[10em] my-4">
      {topBlocks?.blobBlockDatas?.map((blk: any) => {
        return <BlocksCube key={blk?.id} blk={blk} />;
      })}
    </div>
  );
};
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
  // const { data, loading } = useQuery(BLOB_BLOCKS_EXPLORER_QUERY, {
  //   variables: {
  //     skip: LIMIT_PER_PAGE * (page - 1),
  //     limit: LIMIT_PER_PAGE,
  //   },
  // });

  const { data, loading } = useBlocksExplorerWithRPCData({
    page,
  });

  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p>Blob Blocks</p>
      </div>
      <div className="hidden xl:grid xl:grid-cols-7 p-4 border-b text-end border-base-200 text-sm items-center">
        <div className="flex items-center gap-2">
          {" "}
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <Box strokeWidth="1" width={24} height={24} />
          </div>{" "}
          Block #
        </div>
        <p>Validator</p>
        <p>Block Size</p>
        <p>Blob size</p>
        <p>Blob txns</p>
        <p>Blob Fee</p>
        <p className="text-end">ETH Burn 🔥</p>
      </div>
      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <BlocksRowSkeleton
                key={`BlocksRowSkeleton_BlocksRows_Blocks_${idx}`}
              />
            );
          })}
        {data?.map((blk: any) => {
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
  const blobFeeGwei = useMemo(() => {
    return new BigNumber(blk?.totalBlobGasEth).div(1e9).toFormat(5);
  }, [blk?.totalBlobGasEth]);
  const blockNumber = useMemo(() => {
    return new BigNumber(blk?.blockNumber).toFormat(0);
  }, [blk?.blockNumber]);

  const blobSize = useMemo(() => {
    return formatBytes(Number(blk?.totalBlobGas));
  }, [blk?.totalBlobGas]);
  const blockSize = useMemo(() => {
    return formatBytes(Number(blk?.size));
  }, [blk?.totalBlobGas]);
  const ethBurn = useMemo(() => {
    return new BigNumber(blk?.rpcData?.data?.baseFeePerGas)
      .multipliedBy(Number(blk?.rpcData?.data?.gasUsed))
      .div(1e18)
      .toFormat(5);
  }, [blk?.rpcData]);
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 border-b border-base-200 text-sm items-center text-end">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <Box strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
              {blockNumber}
            </Link>

            <p>{timeAgo(new Date(Number(blk.timestamp) * 1000))}</p>
          </div>
        </div>
        {blk?.rpcData?.data?.miner ? (
          <div className="">
            <p>{formatAddress(blk?.rpcData?.data?.miner)}</p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <p>{blockSize}</p>
        </div>
        <div>
          <p>{blobSize}</p>
          <p>{blk?.totalBlobHashesCount} blobs</p>
        </div>
        <div>
          <p>{blk?.totalTransactionCount} transactions</p>
          <p>{blk?.totalBlobTransactionCount} blob tx</p>
        </div>
        {
          <div>
            <p>{formatEthereumValue(blk?.totalBlobGasEth)} </p>
          </div>
        }
        {ethBurn && !isNaN(Number(ethBurn)) ? (
          <div className="">
            <p>{ethBurn} ETH</p>
          </div>
        ) : (
          <p>-</p>
        )}
      </div>
      <div className="flex flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <Box strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
              {blockNumber}
            </Link>

            <p>{timeAgo(new Date(Number(blk.timestamp) * 1000))}</p>
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
    </>
  );
  // return (
  //   <div className="flex flex-wrap gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
  //     <div className="flex items-center gap-2">
  //       <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
  //         <Box strokeWidth="1" width={24} height={24} />
  //       </div>
  //       <div>
  //         <Link className="text-primary" href={`/blocks/${blk?.blockNumber}`}>
  //           {blockNumber}
  //         </Link>

  //         <p>{timeAgo(new Date(Number(blk.timestamp) * 1000))}</p>
  //       </div>
  //     </div>
  //     <div>
  //       <p>{blobSize}</p>
  //       <p>{blk?.totalBlobHashesCount} blobs</p>
  //     </div>
  //     <div>
  //       <p>{blk?.totalTransactionCount} transactions</p>
  //     </div>
  //   </div>
  // );
};
