import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { ETHERSCAN_LINK } from "@/configs/constants";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_BLOCK_QUERY, AVAIL_TXN_QUERY } from "@/lib/apollo/queriesAvail";
import { timeAgo } from "@/lib/time";
import { cn, formatAddress, formatBytes } from "@/lib/utils";
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

type Props = {
  hash: string;
};

function SingleAvailTxn({ hash }: Props) {
  const {
    data: { extrinsic: availTxnData } = {},
    loading: availTxnDataLoading,
  } = useQuery(AVAIL_TXN_QUERY, {
    variables: { id: hash?.toLowerCase() },
    client: availClient,
  });

  const totalData = useMemo(() => {
    const reducedData = {
      byteSize: availTxnData?.dataSubmissions?.aggregates?.sum?.byteSize,
      daFees: availTxnData?.dataSubmissions?.aggregates?.sum?.fees,
      daFeesUSD: availTxnData?.dataSubmissions?.aggregates?.sum?.feesUSD,
      feesUSD: new BigNumber(availTxnData?.fees)
        ?.times(availTxnData?.availPrice)
        .toNumber(),
      fees: availTxnData?.fees,
      daCount: availTxnData?.dataSubmissions?.nodes?.length,
    };
    return reducedData;
  }, [availTxnData]);

  return (
    <div className="grid lg:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="lg:block hidden">
        <Sidebar />
      </div>
      <div className="lg:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">Avail Txn</h2>
        </div>
        {!availTxnDataLoading && !availTxnData && (
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
              <p> #{formatAddress(hash)} is not synced yet.</p>
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
        {(availTxnDataLoading || availTxnData) && (
          <div className=" w-full lg:gap-4 ">
            <div className="border border-base-200  rounded-lg w-full bg-base-100/70 ">
              <div className="flex flex-wrap lg:flex-nowrap w-full items-center justify-between border-b border-base-200 p-5">
                <div className=" flex items-center gap-4">
                  <NotepadText />
                  <div>
                    <div className=" break-words hidden lg:block">{hash}</div>
                    <div className=" break-words lg:hidden block">
                      {formatAddress(hash)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center ">
                  <div className="flex items-center">
                    {availTxnData && <p>{timeAgo(availTxnData?.timestamp)}</p>}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Txn Hash</div>
                {!availTxnDataLoading && (
                  <div className=" break-words hidden lg:block">
                    {availTxnData?.id}
                  </div>
                )}
                {!availTxnDataLoading && availTxnData?.id && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(availTxnData?.id)}
                  </div>
                )}
                {availTxnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Signer</div>
                {!availTxnDataLoading && (
                  <Link
                    href={`/avail/${availTxnData?.signer}`}
                    className=" break-words hidden lg:block text-primary"
                  >
                    {availTxnData?.signer}
                  </Link>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <Link
                    href={`/avail/${availTxnData?.signer}`}
                    className=" break-words lg:hidden block text-primary"
                  >
                    {formatAddress(availTxnData?.signer)}
                  </Link>
                )}
                {availTxnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid border-b  border-base-200 lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Timestamp </div>
                {!availTxnDataLoading && (
                  <div className=" break-words">
                    {new Date(availTxnData?.timestamp + "Z")?.toLocaleString()}
                  </div>
                )}

                {availTxnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Module </div>
                {!availTxnDataLoading && (
                  <div className=" break-words">{availTxnData?.module}</div>
                )}
                {availTxnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Call </div>
                {!availTxnDataLoading && (
                  <div className=" break-words">{availTxnData?.call}</div>
                )}
                {availTxnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="bg-base-200/50 border-b  border-base-200">
                <p className=" p-5 "> Input</p>
                {availTxnData?.argsName?.map((arg: string, idx: number) => {
                  const argVal = availTxnData?.argsValue[idx];
                  return (
                    <code
                      key={arg}
                      className="grid  lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 "
                    >
                      <p className="break-words">{arg}</p>
                      <p className="break-words overflow-hidden">{argVal}</p>
                    </code>
                  );
                })}
              </div>
              {/* </code> */}

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Count</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{totalData?.daCount}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b border-base-200">
                <div className="">Events Count</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData?.nbEvents && (
                  <div className="">{availTxnData?.nbEvents}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Ext Fee</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{totalData?.fees?.toString()} AVAIL</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Ext Fee USD</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{totalData?.feesUSD?.toString()} USD</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{totalData?.daFees?.toString()} AVAIL</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee USD</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{totalData?.daFeesUSD?.toString()} USD</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">AVAIL Price</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">
                    {new BigNumber(availTxnData?.availPrice)?.toString()}USD
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Data Size</div>
                {availTxnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availTxnDataLoading && availTxnData && (
                  <div className="">{formatBytes(totalData?.byteSize)}</div>
                )}
              </div>
            </div>
          </div>
        )}

        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default SingleAvailTxn;
