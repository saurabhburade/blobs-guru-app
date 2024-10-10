import Header from "@/components/Header/Header";
import {
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  GET_BLOB_BLOCK,
} from "@/lib/apollo/queries";
import { cn, formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Database,
  NotepadText,
  SquareDashedBottomCode,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { hexToBigInt } from "viem";
import { useBlock, useTransaction, useTransactionReceipt } from "wagmi";
import BlockTransactions from "./components/BlockTransactions";

type Props = {
  blockNumber: number | string;
};
// @ts-ignore
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
function SingleBlock({ blockNumber }: Props) {
  const { data } = useQuery(GET_BLOB_BLOCK, {
    variables: {
      blockNumber,
    },
  });
  const blockHex = Number(blockNumber)?.toString(16);
  console.log(`🚀 ~ file: SingleBlock.tsx:25 ~ blockHex:`, blockHex);
  const { data: rpcBlock } = useBlock({
    blockNumber: hexToBigInt(`0x${blockHex}`),
  });
  const { data: rpctxn } = useTransaction({
    hash: "0xee48346ce9f01fa03f3e96a71669a6100b70ef848454aedce814d17c2fc02546",
  });
  const { data: rpctxnRc } = useTransactionReceipt({
    hash: "0xee48346ce9f01fa03f3e96a71669a6100b70ef848454aedce814d17c2fc02546",
  });
  console.log(`🚀 ~ file: SingleBlock.tsx:27 ~ rpcBlock:`, rpcBlock);
  console.log(`🚀 ~ file: SingleBlock.tsx:44 ~ rpctxn:`, { rpctxn, rpctxnRc });
  const feeEth = useMemo(() => {
    return new BigNumber(data?.blobBlockData?.totalFeeEth)
      .div(1e18)
      .toFormat(4);
  }, [data?.blobBlockData?.totalFeeEth]);
  const blockNumberRes = useMemo(() => {
    return new BigNumber(data?.blobBlockData?.blockNumber).toFormat(0);
  }, [data?.blobBlockData?.blockNumber]);
  const totalBlobHashesCount = useMemo(() => {
    return data?.blobBlockData?.totalBlobHashesCount;
  }, [data?.blobBlockData?.totalBlobHashesCount]);
  const blobSize = useMemo(() => {
    return formatBytes(Number(data?.blobBlockData?.totalBlobGas));
  }, [data?.blobBlockData?.totalBlobGas]);
  const percentOfBlobs = useMemo(() => {
    return (
      (Number(data?.blobBlockData?.totalBlobTransactionCount) * 100) /
      Number(data?.blobBlockData?.totalTransactionCount)
    );
  }, [data?.blobBlockData?.totalBlobGas]);
  console.log(
    `🚀 ~ file: SingleBlock.tsx:47 ~ percentOfBlobs:`,
    percentOfBlobs
  );

  console.log(
    `🚀 ~ file: SingleBlock.tsx:19 ~ data:`,
    data?.blobBlockData,
    rpcBlock
  );
  return (
    <div>
      <Header />
      <div className="mx-auto w-full lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="grid lg:grid-cols-[3fr_1fr] w-full lg:gap-4">
          <div className="border border-base-200  rounded-lg w-full  ">
            <div className="flex flex-wrap lg:flex-nowrap w-full items-center justify-between border-b border-base-200 p-5">
              <div className=" flex items-center gap-4">
                <Box />
                <p className="lg:text-xl font-bold">Block #{blockNumberRes}</p>
              </div>
              <div className="flex gap-2 items-center ">
                <Link href={`/blocks/${Number(blockNumber) - 1}`}>
                  <button className="btn btn-ghost btn-sm w-fit p-1">
                    <ChevronLeft />
                  </button>
                </Link>
                <Link href={`/blocks/${Number(blockNumber) + 1}`}>
                  <button className="btn btn-ghost btn-sm p-1">
                    <ChevronRight />
                  </button>
                </Link>

                <button className="btn btn-ghost btn-sm">
                  View on Etherscan
                </button>
              </div>
            </div>
            <div>
              <div className="border border-base-200 h-fit rounded-lg lg:hidden block">
                <div className="p-5 flex items-center gap-4 border-b border-base-200">
                  <img
                    src="/images/logox.jpeg"
                    className="rounded-lg"
                    width={20}
                    height={20}
                    alt=""
                  />
                  <p className="text-md font-bold">Blobs Overview</p>
                </div>
                <div className=" space-y-5 py-2">
                  <div className="flex w-full overflow-hidden px-5 pt-2">
                    <div
                      className={cn(
                        "h-5  bg-pink-500 !rounded-full",
                        `!w-[${(100 - percentOfBlobs)?.toFixed(0)}%]`
                      )}
                      style={{
                        width: `${(100 - percentOfBlobs)?.toFixed(0)}%`,
                      }}
                    ></div>
                    <div
                      className={cn(
                        "h-5  bg-indigo-500 !rounded-full",

                        `!w-[${percentOfBlobs?.toFixed(0)}%]`
                      )}
                      style={{
                        width: `${percentOfBlobs?.toFixed(0)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between border-b px-5 py-2 border-base-200">
                    <div className="">
                      <p className=" font-semibold text-lg">
                        {Number(data?.blobBlockData?.totalTransactionCount) -
                          Number(
                            data?.blobBlockData?.totalBlobTransactionCount
                          )}
                      </p>

                      <p className="flex gap-2 items-center">
                        <span className="">
                          <NotepadText width={14} />
                        </span>
                        Regular Txn
                      </p>
                    </div>
                    <div className=" text-end">
                      <p className=" font-semibold text-lg">
                        {data?.blobBlockData?.totalBlobTransactionCount}
                      </p>

                      <p className="flex gap-2 items-center">
                        <span className="">
                          <NotepadText width={14} />
                        </span>
                        Blobs Txns
                      </p>
                    </div>
                  </div>

                  <div className=" px-5">
                    <p className=" font-semibold text-lg">{blobSize}</p>

                    <p className="flex gap-2 items-center">
                      <span className="">
                        <Database width={14} />
                      </span>
                      Blobs Size
                    </p>
                  </div>
                  <div className="px-4">
                    <p className=" font-semibold text-lg">{feeEth} ETH</p>

                    <p className="flex gap-2 items-center">
                      <span className="">
                        <img
                          src="/images/icons/eth.svg"
                          width={14}
                          className="fill-current"
                          alt=""
                        />
                      </span>
                      Blob gas
                    </p>
                  </div>
                  <div className="px-4">
                    <p className=" font-semibold text-lg">
                      {totalBlobHashesCount}
                    </p>

                    <p className="flex gap-2 items-center">
                      <span className="">
                        <SquareDashedBottomCode width={14} />
                      </span>
                      Total Blobs
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Block Hash</div>
                <div className=" break-words hidden lg:block">
                  {rpcBlock?.hash}
                </div>
                {rpcBlock?.hash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.hash)}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Time</div>
                <div className="">
                  {" "}
                  {new Date(
                    Number(rpcBlock?.timestamp?.toString()) * 1000
                  ).toLocaleString()}
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Transactions </div>
                <div className="">
                  <p>Total :: {Number(rpcBlock?.transactions?.length)}</p>
                  <p>
                    Blobs ::{" "}
                    {Number(
                      data?.blobBlockData?.totalBlobTransactionCount?.toString()
                    )}
                  </p>
                  <p>
                    Withdraw ::{" "}
                    {Number(rpcBlock?.withdrawals?.length?.toString())}
                  </p>
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Block Size </div>
                <div className="">{Number(rpcBlock?.size?.toString())}</div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Miner</div>
                <div className=" break-words hidden lg:block">
                  {rpcBlock?.miner}
                </div>
                {rpcBlock?.miner && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.miner?.toString())}
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Parent hash</div>
                <div className=" break-words hidden lg:block">
                  {rpcBlock?.parentHash}
                </div>
                {rpcBlock?.parentHash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.parentHash?.toString())}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] w-full grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-fit p-5">
                <div className="break-words">Total Difficulty </div>
                <div className="break-words lg:w-full w-[10em] overflow-hidden">
                  {new BigNumber(
                    //   @ts-ignore
                    rpcBlock?.totalDifficulty
                  ).toFormat(0)}
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 align-middle items-center">
                <div className="">Gas Used</div>
                <div className="flex gap-2 items-center">
                  <p>
                    {rpcBlock?.gasUsed?.toString()}{" "}
                    <span>
                      {(
                        (Number(rpcBlock?.gasUsed?.toString()) * 100) /
                        Number(rpcBlock?.gasLimit?.toString())
                      )?.toFixed(2)}{" "}
                      %
                    </span>
                  </p>
                  <progress
                    className="progress w-40"
                    value={rpcBlock?.gasUsed?.toString()}
                    max={rpcBlock?.gasLimit?.toString()}
                  ></progress>
                  {/* <p>{rpcBlock?.gasLimit?.toString()}</p> */}
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Gas limit</div>
                <div className="">{rpcBlock?.gasLimit?.toString()}</div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Base Fee Per Gas</div>
                <div className="">
                  {/* @ts-ignore */}
                  {new BigNumber(rpcBlock?.baseFeePerGas?.toString())
                    ?.div(1e9)
                    ?.toFormat(8)}{" "}
                  Gwei
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">ETH Burn 🔥</div>
                <div className="">
                  {/* @ts-ignore */}
                  {new BigNumber(rpcBlock?.gasUsed?.toString())
                    // @ts-ignore
                    .multipliedBy(rpcBlock?.baseFeePerGas)
                    ?.div(1e18)
                    ?.toFormat(8)}{" "}
                  ETH
                </div>
              </div>
            </div>
          </div>
          <div className="border border-base-200 h-fit rounded-lg lg:block hidden">
            <div className="p-5 flex items-center gap-4 border-b border-base-200">
              <img
                src="/images/logox.jpeg"
                className="rounded-lg"
                width={32}
                height={32}
                alt=""
              />
              <p className="text-xl font-bold">Blobs Overview</p>
            </div>
            <div className=" space-y-5 py-2">
              <div className="flex w-full overflow-hidden px-5 pt-2">
                <div
                  className={cn(
                    "h-5  bg-pink-500 !rounded-full",
                    `!w-[${(100 - percentOfBlobs)?.toFixed(0)}%]`
                  )}
                  style={{
                    width: `${(100 - percentOfBlobs)?.toFixed(0)}%`,
                  }}
                ></div>
                <div
                  className={cn(
                    "h-5  bg-indigo-500 !rounded-full",

                    `!w-[${percentOfBlobs?.toFixed(0)}%]`
                  )}
                  style={{
                    width: `${percentOfBlobs?.toFixed(0)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between border-b px-5 py-2 border-base-200">
                <div className="">
                  <p className=" font-semibold text-lg">
                    {Number(data?.blobBlockData?.totalTransactionCount) -
                      Number(data?.blobBlockData?.totalBlobTransactionCount)}
                  </p>

                  <p className="flex gap-2 items-center">
                    <span className="">
                      <NotepadText width={14} />
                    </span>
                    Regular Txn
                  </p>
                </div>
                <div className=" text-end">
                  <p className=" font-semibold text-lg">
                    {data?.blobBlockData?.totalBlobTransactionCount}
                  </p>

                  <p className="flex gap-2 items-center">
                    <span className="">
                      <NotepadText width={14} />
                    </span>
                    Blobs Txns
                  </p>
                </div>
              </div>

              <div className=" px-5">
                <p className=" font-semibold text-lg">{blobSize}</p>

                <p className="flex gap-2 items-center">
                  <span className="">
                    <Database width={14} />
                  </span>
                  Blobs Size
                </p>
              </div>
              <div className="px-4">
                <p className=" font-semibold text-lg">{feeEth} ETH</p>

                <p className="flex gap-2 items-center">
                  <span className="">
                    <img
                      src="/images/icons/eth.svg"
                      width={14}
                      className="fill-current"
                      alt=""
                    />
                  </span>
                  Blob gas
                </p>
              </div>
              <div className="px-4">
                <p className=" font-semibold text-lg">{totalBlobHashesCount}</p>

                <p className="flex gap-2 items-center">
                  <span className="">
                    <SquareDashedBottomCode width={14} />
                  </span>
                  Total Blobs
                </p>
              </div>
            </div>
          </div>
        </div>
        {Number(data?.blobBlockData?.totalBlobTransactionCount) > 0 && (
          <BlockTransactions
            blockNumber={blockNumber}
            totalBlobTxns={
              Number(data?.blobBlockData?.totalBlobTransactionCount) || 0
            }
          />
        )}
      </div>
    </div>
  );
}

export default SingleBlock;
