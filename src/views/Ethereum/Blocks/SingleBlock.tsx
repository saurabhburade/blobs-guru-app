"use client";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { ETHERSCAN_LINK } from "@/configs/constants";
import { apolloClient } from "@/lib/apollo/client";

import { timeAgo } from "@/lib/time";
import {
  cn,
  formatAddress,
  formatBytes,
  parseEthHashString,
} from "@/lib/utils";
import PoweredBy from "@/views/Home/components/PoweredBy";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import Lottie from "lottie-react";
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
import blocksAnimation from "@/assets/animations/blocks.json";
import { ETHEREUM_BLOCK_QUERY } from "@/lib/apollo/queriesEthereum";

type Props = {
  blockNumber: number | string;
};

function SingleBlock({ blockNumber }: Props) {
  const { data: { blockDatum: blockData } = {}, loading: blockDataLoading } =
    useQuery(ETHEREUM_BLOCK_QUERY, {
      variables: { id: blockNumber?.toString() },
      client: apolloClient,
    });

  const totalData = useMemo(() => {
    const reducedData = blockData?.transactions?.nodes.reduce(
      (acc: any, node: any) => {
        acc.byteSize += Number(node?.totalBytes) || 0;
        if (Number(node?.totalBytes) > 0) {
          acc.daFeesUSD += Number(node.txFeeUSD) / 1e18 || 0;
          acc.txFeeNative += Number(node.txFeeNative) / 1e18 || 0;
        }
        acc.feesUSD += Number(node.txFeeUSD) / 1e18 || 0;
        acc.fees += Number(node.txFeeNative) / 1e18 || 0;

        acc.daCount += Number(node?.blobs?.nodes?.length) || 0;

        return acc;
      },
      {
        byteSize: 0,
        daFees: 0,
        daFeesUSD: 0,
        feesUSD: 0,
        fees: 0,
        daCount: 0,
      }
    );
    return reducedData;
  }, [blockData]);

  return (
    <div className="grid xl:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="xl:block hidden">
        <Sidebar />
      </div>
      <div className="xl:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">Ethereum Block</h2>
        </div>
        {!blockDataLoading && !blockData && (
          <div className="mx-auto w-full lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 ">
            <div className="flex items-center justify-center">
              {/* <DotLottieReact
              src="/animations/blocks.json"
              width={170}
              height={170}
              loop
              autoplay
            /> */}
              <Lottie animationData={blocksAnimation} />
            </div>
            <div className="flex items-center justify-center flex-col gap-2">
              <p> #{blockNumber} Block is not synced yet.</p>
              <button
                className="btn w-fit"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reload
              </button>
            </div>
          </div>
        )}
        {(blockDataLoading || blockData) && (
          <div className=" w-full lg:gap-4 ">
            <div className="border border-base-200  rounded-lg w-full bg-base-100/70 ">
              <div className="flex flex-wrap lg:flex-nowrap w-full items-center justify-between border-b border-base-200 p-5">
                <div className=" flex items-center gap-4">
                  <Box />
                  <div>
                    <p>{blockNumber}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center ">
                  <div className="flex items-center">
                    {blockData && <p>{timeAgo(blockData?.timestamp)}</p>}
                  </div>
                  <Link href={`/ethereum/blocks/${Number(blockNumber) - 1}`}>
                    <button className="btn btn-ghost btn-sm w-fit p-1">
                      <ChevronLeft />
                    </button>
                  </Link>
                  <Link href={`/ethereum/blocks/${Number(blockNumber) + 1}`}>
                    <button className="btn btn-ghost btn-sm p-1">
                      <ChevronRight />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Block Hash</div>
                {!blockDataLoading && (
                  <div className=" break-words hidden lg:block">
                    {parseEthHashString(blockData?.hash)}
                  </div>
                )}
                {!blockDataLoading && blockData?.hash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(parseEthHashString(blockData?.hash))}
                  </div>
                )}
                {blockDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid border-b  border-base-200 lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Timestamp </div>
                {!blockDataLoading && (
                  <div className=" break-words">
                    {new Date(blockData?.timestamp)?.toLocaleString()}
                  </div>
                )}

                {blockDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Count</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData && (
                  <div className="">{totalData?.daCount}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Extrinsics Count</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData?.totalTransactionCount && (
                  <div className="">{blockData?.totalTransactionCount}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b border-base-200">
                <div className="">Events Count</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData?.totalEventsCount && (
                  <div className="">{blockData?.totalEventsCount}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Block Fee</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData?.totalBlockFeeNatve && (
                  <div className="">
                    {new BigNumber(blockData?.totalBlockFeeNatve)
                      ?.div(1e18)
                      ?.toString()}{" "}
                    ETH
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Block Fee USD</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData?.totalBlockFeeUSD && (
                  <div className="">
                    $
                    {new BigNumber(blockData?.totalBlockFeeUSD)
                      ?.div(1e18)
                      ?.toString()}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">ETH Price</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}

                {!blockDataLoading && blockData?.avgNativePrice && (
                  <div className="">
                    $ {new BigNumber(blockData?.avgNativePrice)?.toString()}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && totalData?.byteSize && (
                  <div className="">{totalData?.txFeeNative?.toString()}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee USD</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData?.totalBlobSize && (
                  <div className="">{totalData?.daFeesUSD}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Data Size</div>
                {blockDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!blockDataLoading && blockData && (
                  <div className="">{formatBytes(totalData?.byteSize)}</div>
                )}
              </div>
            </div>
            <div className="my-5">
              <TxnRows
                txns={blockData?.transactions?.nodes}
                loading={blockDataLoading}
              />
            </div>
          </div>
        )}

        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default SingleBlock;

function TxnRows({ txns, loading }: any) {
  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p> Transactions</p>
      </div>
      <div className="hidden xl:grid xl:grid-cols-7 p-4 border-b text-end border-base-200 text-sm items-center">
        <div className="flex items-center gap-2">
          {" "}
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>{" "}
          Txn #
        </div>
        <p>From</p>
        <p>Events</p>
        <p>DA size</p>
        <p>Position</p>
        <p>Txn fee</p>
        <p className="text-end">DA fee</p>
      </div>
      <div className="px-4  ">
        {loading &&
          new Array(10)?.fill(1)?.map((num, idx) => {
            return (
              <TransactionRowSkeleton
                key={`TransactionRowSkeleton_SINGLE_ACCOUNT_${idx}`}
              />
            );
          })}
        {!loading &&
          txns?.map((txn: any) => {
            return <TransactionRow key={txn?.id} txn={txn} />;
          })}
      </div>
    </div>
  );
}

const TransactionRow = ({ txn }: any) => {
  const txFee = useMemo(() => {
    return new BigNumber(txn?.txFeeNative)?.div(10 ** 18).toFormat(5);
  }, [txn?.txFeeNative]);

  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 border-b border-base-200 text-sm items-center text-end">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link
              href={`/ethereum/txn/${parseEthHashString(txn?.hash)}`}
              className="text-primary"
            >
              {" "}
              {formatAddress(parseEthHashString(txn?.hash))}
            </Link>

            <p>{timeAgo(new Date(Number(txn.timestamp)))}</p>
          </div>
        </div>
        {txn?.signerId ? <p>{formatAddress(txn?.signerId)}</p> : <p>-</p>}
        {txn?.nEvents ? (
          <div className="">
            <p>{txn?.nEvents}</p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <p>{formatBytes(txn?.totalBytes || 0)} </p>
        </div>
        <div>
          <p>
            <span>{txn?.blockHeightId}</span>
          </p>
        </div>

        <div>
          <p>{txFee} ETH</p>
        </div>
        <div>
          <p>{txn?.totalBytes > 0 ? txFee : 0} ETH </p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link href={`/ethereum/txn/${txn?.id}`} className="text-primary">
              {" "}
              {formatAddress(txn?.id)}
            </Link>
            <p>{timeAgo(new Date(txn.timestamp + "Z"))}</p>
          </div>
        </div>
        <div>
          <p>{formatBytes(txn?.totalBytes || 0)} </p>
        </div>
        <div className="hidden  md:block xl:hidden text-end">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">{txFee} ETH</p>
        </div>
        <div className="flex my-2 md:hidden  lg:my-0 justify-between  w-full  lg:col-span-1 ">
          <p className="lg:text-end ">From : {formatAddress(txn?.signerId)}</p>
          <p className=" text-end">{txFee} ETH</p>
        </div>
      </div>
    </>
  );
};
