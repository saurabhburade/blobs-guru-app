import Header from "@/components/Header/Header";
import {
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_TRANSACTION_QUERY,
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
  hash: string;
};
// @ts-ignore
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
function SingleTransaction({ hash }: Props) {
  const { data, loading: blobTxIsLoading } = useQuery(BLOB_TRANSACTION_QUERY, {
    variables: {
      hash,
    },
  });
  const { data: rpcTxn, isLoading: rpcTxnIsLoading = true } = useTransaction({
    // @ts-ignore
    hash,
  });
  // const rpcTxnIsLoading = true;
  const { data: rpcBlock, isLoading: rpcBlockIsLoading } = useBlock({
    // @ts-ignore
    blockNumber: rpcTxn?.blockNumber,
  });

  const blobHashesLength = useMemo(() => {
    return Number(data?.blobTransaction?.blobHashesLength);
  }, [data?.blobTransaction?.blobHashesLength]);
  const blobHashes = useMemo(() => {
    return data?.blobTransaction?.blobHashes;
  }, [data?.blobTransaction?.blobHashes]);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(data?.blobTransaction?.blobGas));
  }, [data?.blobTransaction?.blobGas]);
  const blobGasEth = useMemo(() => {
    return new BigNumber(data?.blobTransaction?.blobGasEth)
      .div(1e18)
      .toFormat(12);
  }, [data?.blobTransaction?.blobGasEth]);
  const feeEth = useMemo(() => {
    return new BigNumber(data?.blobTransaction?.gasUsed)
      .multipliedBy(Number(data?.blobTransaction?.gasPrice))
      .div(1e18)
      .toFormat(4);
  }, [data?.blobTransaction?.gasUsed, data?.blobTransaction?.gasPrice]);
  return (
    <div>
      <Header />
      <div className="mx-auto w-full p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="grid lg:grid-cols-[3fr_1fr] w-full gap-4">
          <div className="border border-base-200  rounded-lg w-full  ">
            <div className="flex flex-wrap w-full items-center justify-between border-b border-base-200 p-5">
              <div className=" flex items-center gap-4 ">
                <Box />
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.transactionIndex && (
                  <p className="lg:text-xl font-bold">
                    Transaction #{rpcTxn?.blockNumber?.toString()}::
                    {rpcTxn?.transactionIndex}
                  </p>
                )}
              </div>
              <div className="flex gap-2 lg:w-fit justify-center w-full">
                <Link
                  href={`${ETHERSCAN_LINK}/tx/${hash}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="btn btn-ghost btn-sm"
                >
                  View on Etherscan
                </Link>
              </div>
            </div>
            <div className="border border-base-200 h-fit rounded-lg lg:hidden ">
              <div className=" space-y-5 py-2">
                <div className=" px-5">
                  {!blobTxIsLoading && totalBlobSize && (
                    <p className=" font-semibold text-lg">{totalBlobSize}</p>
                  )}
                  {blobTxIsLoading && (
                    <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  <p className="flex gap-2 items-center">
                    <span className="">
                      <Database width={14} />
                    </span>
                    Blobs Size
                  </p>
                </div>
                <div className="px-5">
                  {blobTxIsLoading && (
                    <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {!blobTxIsLoading && blobGasEth && (
                    <p className=" font-semibold text-lg ">{blobGasEth} ETH</p>
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
                <div className="px-5">
                  {blobTxIsLoading && (
                    <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                  )}
                  {!blobTxIsLoading && blobHashesLength && (
                    <p className=" font-semibold text-lg">{blobHashesLength}</p>
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
            <div>
              <div className="grid grid-cols-[0.75fr_3fr] gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Transaction Hash</div>
                {!rpcTxnIsLoading && (
                  <div className=" break-words hidden lg:block">
                    {rpcTxn?.hash}
                  </div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.hash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcTxn?.hash)}
                  </div>
                )}
                {rpcTxnIsLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">Time</div>
                {rpcBlockIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcBlockIsLoading && rpcBlock?.timestamp && (
                  <p className="">
                    {new Date(
                      Number(rpcBlock?.timestamp?.toString()) * 1000
                    ).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">Block</div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.blockNumber && (
                  <p className="">{rpcTxn?.blockNumber?.toString()}</p>
                )}
                {/* <div className="">{rpcTxn?.blockNumber?.toString()}</div> */}
              </div>
              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">From</div>

                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.from && (
                  <div className=" break-words hidden lg:block">
                    {rpcTxn?.from}
                  </div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.from && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcTxn?.from?.toString())}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">To</div>

                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.to && (
                  <div className=" break-words hidden lg:block">
                    {rpcTxn?.to}
                  </div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.to && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(rpcTxn?.to?.toString())}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5 border-b  border-base-200">
                <div className="">Value</div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading &&
                  (rpcTxn?.value || rpcTxn?.value.toString() === "0") && (
                    <div className=" ">{rpcTxn?.value?.toString()}</div>
                  )}
              </div>

              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5 ">
                <div className="">Gas Fees</div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.gas && rpcTxn?.gasPrice && (
                  <div className=" ">
                    {/* @ts-ignore */}
                    {new BigNumber(rpcTxn?.gas?.toString())
                      //  @ts-ignore
                      .multipliedBy(rpcTxn?.gasPrice?.toString())
                      ?.div(1e18)
                      ?.toFormat(8)}{" "}
                    ETH
                  </div>
                )}
              </div>
              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5 ">
                <div className="">Gas Limit</div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.gas && (
                  <div className=" ">{Number(rpcTxn?.gas?.toString())}</div>
                )}
              </div>

              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">Gas Price </div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.gasPrice && (
                  <div className=" ">
                    {/* @ts-ignore */}
                    {new BigNumber(rpcTxn?.gasPrice?.toString())
                      .div(1e9)
                      .toFormat(5)}{" "}
                    Gwei
                  </div>
                )}
              </div>
              {/* <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">blobGasEth Price </div>
                <div className="">
                  {new BigNumber(blobGasEth).toFormat(5)} Gwei
                </div>
              </div> */}

              <div className="grid grid-cols-[0.75fr_3fr] w-full p-5">
                <div className="">Input</div>
                {rpcTxnIsLoading && (
                  <div className=" break-words w-[10em] lg:w-[15em]  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!rpcTxnIsLoading && rpcTxn?.input && (
                  <code className=" p-2 bg-base-200/50 rounded-lg w-[10] lg:w-[40em] max-h-[20em] overflow-scroll break-words">
                    {rpcTxn?.input?.toString()}
                  </code>
                )}
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
              <div className=" px-5">
                {blobTxIsLoading && (
                  <div className=" break-words w-[10em]   block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobTxIsLoading && totalBlobSize && (
                  <div className=" font-semibold text-lg ">{totalBlobSize}</div>
                )}

                <p className="flex gap-2 items-center">
                  <span className="">
                    <Database width={14} />
                  </span>
                  Blobs Size
                </p>
              </div>
              <div className="px-5">
                {blobTxIsLoading && (
                  <div className=" break-words w-[10em] block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobTxIsLoading && blobGasEth && (
                  <div className="  font-semibold text-lg">
                    {blobGasEth} ETH
                  </div>
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
              <div className="px-5">
                {blobTxIsLoading && (
                  <div className=" break-words w-[10em]   block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blobTxIsLoading && blobHashesLength && (
                  <div className=" font-semibold text-lg ">
                    {blobHashesLength}
                  </div>
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
        <div className=" bg-base-100 border rounded-lg border-base-200 ">
          <div className="flex p-4 border-base-200">
            <p>Blobs</p>
          </div>
          {blobHashes?.map((bh: any) => {
            return <BlobRow txn={data?.blobTransaction} id={bh} key={bh} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default SingleTransaction;

const BlobRow = ({ txn, id }: any) => {
  //       id
  //   from
  //   to
  //   blobHashesLength
  //   nonce
  //   gasPrice
  //   gasUsed
  //   blobGasEth
  //   blobGas

  return (
    <div className="px-4 flex-wrap flex items-center justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
          <img
            src="/images/logox.jpeg"
            className="rounded-lg"
            width={32}
            height={32}
            alt=""
          />
        </div>
        <div>
          <p className="lg:block hidden">{id}</p>
          {id && <p className="lg:hidden block">{formatAddress(id)}</p>}
        </div>
      </div>
      <div className="flex">
        <Link
          href={`${ETHERSCAN_LINK}/tx/${txn?.id}#blobs`}
          target="_blank"
          referrerPolicy="no-referrer"
          className="btn btn-ghost btn-sm"
        >
          View on Etherscan
        </Link>{" "}
        {/* <button className="btn btn-ghost btn-sm">Swarm</button> */}
      </div>
    </div>
  );
};
