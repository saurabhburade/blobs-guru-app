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
import { ETHERSCAN_LINK } from "@/configs/constants";

type Props = {
  blockNumber: number | string;
};
// @ts-ignore
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
function SingleBlock({ blockNumber }: Props) {
  const { data, loading: blobLoading } = useQuery(GET_BLOB_BLOCK, {
    variables: {
      blockNumber,
    },
  });
  const blockHex = Number(blockNumber)?.toString(16);

  const { data: rpcBlock, isLoading: rpcBlockIsLoading } = useBlock({
    blockNumber: hexToBigInt(`0x${blockHex}`),
  });

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

  return (
    <div>
      <Header />
      <div className="mx-auto w-full lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="grid lg:grid-cols-[3fr_1fr] w-full lg:gap-4">
          <div className="border border-base-200  rounded-lg w-full bg-base-100/70 ">
            <div className="flex flex-wrap lg:flex-nowrap w-full items-center justify-between border-b border-base-200 p-5">
              <div className=" flex items-center gap-4">
                <Box />
                {blobLoading && (
                  <div className=" break-words w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobLoading && data?.blobBlockData && (
                  <p className="lg:text-xl font-bold">
                    Block #{blockNumberRes}
                  </p>
                )}
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

                <Link
                  href={`${ETHERSCAN_LINK}/block/${Number(blockNumber)}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="btn btn-ghost btn-sm"
                >
                  View on Etherscan
                </Link>
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
                  {blobLoading && (
                    <div className="flex w-full overflow-hidden px-5 pt-2">
                      <div className=" break-words w-full block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>{" "}
                    </div>
                  )}
                  {!blobLoading && (
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
                  )}
                  <div className="flex justify-between border-b px-5 py-2 border-base-200">
                    <div className="">
                      {blobLoading && (
                        <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                      )}
                      {!blobLoading && data?.blobBlockData && (
                        <p className=" font-semibold text-lg">
                          {Number(data?.blobBlockData?.totalTransactionCount) -
                            Number(
                              data?.blobBlockData?.totalBlobTransactionCount
                            )}
                        </p>
                      )}

                      <p className="flex gap-2 items-center">
                        <span className="">
                          <NotepadText width={14} />
                        </span>
                        Regular Txn
                      </p>
                    </div>
                    <div className=" text-end">
                      {blobLoading && (
                        <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                      )}
                      {!blobLoading && data?.blobBlockData && (
                        <p className=" font-semibold text-lg">
                          {data?.blobBlockData?.totalBlobTransactionCount}
                        </p>
                      )}

                      <p className="flex gap-2 items-center">
                        <span className="">
                          <NotepadText width={14} />
                        </span>
                        Blobs Txns
                      </p>
                    </div>
                  </div>

                  <div className=" px-5">
                    {blobLoading && (
                      <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                    )}
                    {!blobLoading && data?.blobBlockData && (
                      <p className=" font-semibold text-lg">{blobSize}</p>
                    )}

                    <p className="flex gap-2 items-center">
                      <span className="">
                        <Database width={14} />
                      </span>
                      Blobs Size
                    </p>
                  </div>
                  <div className="px-4">
                    {blobLoading && (
                      <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                    )}
                    {!blobLoading && data?.blobBlockData && (
                      <p className=" font-semibold text-lg">{feeEth} ETH</p>
                    )}
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
                    {blobLoading && (
                      <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                    )}
                    {!blobLoading && data?.blobBlockData && (
                      <p className=" font-semibold text-lg">
                        {totalBlobHashesCount}
                      </p>
                    )}

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
                {!rpcBlockIsLoading && (
                  <div className=" break-words hidden lg:block">
                    {rpcBlock?.hash}
                  </div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.hash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.hash)}
                  </div>
                )}
                {rpcBlockIsLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Time</div>
                {!rpcBlockIsLoading && (
                  <div className=" break-words hidden lg:block">
                    {new Date(
                      Number(rpcBlock?.timestamp?.toString()) * 1000
                    ).toLocaleString()}
                  </div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.hash && (
                  <div className=" break-words lg:hidden block">
                    {new Date(
                      Number(rpcBlock?.timestamp?.toString()) * 1000
                    ).toLocaleString()}
                  </div>
                )}
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Transactions </div>
                <div className="space-y-2">
                  {rpcBlockIsLoading && (
                    <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {rpcBlockIsLoading && (
                    <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {rpcBlockIsLoading && (
                    <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {!rpcBlockIsLoading && rpcBlock?.transactions && (
                    <p>Total :: {Number(rpcBlock?.transactions?.length)}</p>
                  )}
                  {!rpcBlockIsLoading && data?.blobBlockData && (
                    <p>
                      Blobs ::{" "}
                      {Number(
                        data?.blobBlockData?.totalBlobTransactionCount?.toString()
                      )}
                    </p>
                  )}
                  {!rpcBlockIsLoading && rpcBlock?.withdrawals && (
                    <p>
                      Withdraw ::{" "}
                      {Number(rpcBlock?.withdrawals?.length?.toString())}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Block Size </div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.size && (
                  <div className="">{Number(rpcBlock?.size?.toString())}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Miner</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.miner && (
                  <div className=" break-words hidden lg:block">
                    {rpcBlock?.miner}
                  </div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.miner && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.miner?.toString())}
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Parent hash</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.parentHash && (
                  <div className=" break-words hidden lg:block">
                    {rpcBlock?.parentHash}
                  </div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.parentHash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcBlock?.parentHash?.toString())}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] w-full grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-fit p-5">
                <div className="break-words">Total Difficulty </div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.totalDifficulty && (
                  <div className="break-words lg:w-full w-[10em] overflow-hidden">
                    {new BigNumber(
                      //   @ts-ignore
                      rpcBlock?.totalDifficulty
                    ).toFormat(0)}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 align-middle items-center">
                <div className="">Gas Used</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading &&
                  rpcBlock?.gasUsed &&
                  rpcBlock?.gasLimit && (
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
                  )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Gas limit</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.gasLimit && (
                  <div className="">{rpcBlock?.gasLimit?.toString()}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Base Fee Per Gas</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.baseFeePerGas && (
                  <div className="">
                    {/* @ts-ignore */}
                    {new BigNumber(rpcBlock?.baseFeePerGas?.toString())
                      ?.div(1e9)
                      ?.toFormat(8)}{" "}
                    Gwei
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">ETH Burn 🔥</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading &&
                  rpcBlock?.gasUsed &&
                  rpcBlock?.baseFeePerGas && (
                    <div className="">
                      {/* @ts-ignore */}
                      {new BigNumber(rpcBlock?.gasUsed?.toString())
                        // @ts-ignore
                        .multipliedBy(rpcBlock?.baseFeePerGas)
                        ?.div(1e18)
                        ?.toFormat(8)}{" "}
                      ETH
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="border border-base-200 h-fit rounded-lg lg:block hidden bg-base-100/70">
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
              {blobLoading && (
                <div className="flex w-full overflow-hidden px-5 pt-2">
                  <div className=" break-words w-full block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>{" "}
                </div>
              )}
              {!blobLoading && (
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
              )}
              <div className="flex justify-between border-b px-5 py-2 border-base-200">
                <div className="">
                  {blobLoading && (
                    <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {!blobLoading && data?.blobBlockData && (
                    <p className=" font-semibold text-lg">
                      {Number(data?.blobBlockData?.totalTransactionCount) -
                        Number(data?.blobBlockData?.totalBlobTransactionCount)}
                    </p>
                  )}

                  <p className="flex gap-2 items-center">
                    <span className="">
                      <NotepadText width={14} />
                    </span>
                    Regular Txn
                  </p>
                </div>
                <div className=" text-end">
                  {blobLoading && (
                    <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {!blobLoading && data?.blobBlockData && (
                    <p className=" font-semibold text-lg">
                      {data?.blobBlockData?.totalBlobTransactionCount}
                    </p>
                  )}

                  <p className="flex gap-2 items-center">
                    <span className="">
                      <NotepadText width={14} />
                    </span>
                    Blobs Txns
                  </p>
                </div>
              </div>

              <div className=" px-5">
                {blobLoading && (
                  <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobLoading && data?.blobBlockData && (
                  <p className=" font-semibold text-lg">{blobSize}</p>
                )}

                <p className="flex gap-2 items-center">
                  <span className="">
                    <Database width={14} />
                  </span>
                  Blobs Size
                </p>
              </div>
              <div className="px-4">
                {blobLoading && (
                  <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobLoading && data?.blobBlockData && (
                  <p className=" font-semibold text-lg">{feeEth} ETH</p>
                )}

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
                {blobLoading && (
                  <div className=" break-words w-2/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobLoading && data?.blobBlockData && (
                  <p className=" font-semibold text-lg">
                    {totalBlobHashesCount}
                  </p>
                )}

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
