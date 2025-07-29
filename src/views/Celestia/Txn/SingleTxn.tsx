import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { ETHERSCAN_LINK } from "@/configs/constants";
import { celestiaClient } from "@/lib/apollo/client";

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
import { CELESTIA_TXN_QUERY } from "@/lib/apollo/queriesCelestia";

type Props = {
  hash: string;
};

function SingleTxn({ hash }: Props) {
  const { data: { transactionDatum: txnData } = {}, loading: txnDataLoading } =
    useQuery(CELESTIA_TXN_QUERY, {
      variables: { id: hash?.toUpperCase() },
      client: celestiaClient,
    });

  const totalData = useMemo(() => {
    const reducedData = {
      byteSize: txnData?.totalBytes,
      daFees: txnData?.txFeeNative,
      daFeesUSD: txnData?.txFeeUSD,
      feesUSD: txnData?.txFeeUSD,
      fees: txnData?.txFeeNative,
      daCount: txnData?.blobs?.nodes?.length,
    };
    return reducedData;
  }, [txnData]);

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
          <h2 className="lg:text-xl text-xl font-semibold">Celestia Txn</h2>
        </div>
        {!txnDataLoading && !txnData && (
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
        {(txnDataLoading || txnData) && (
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
                    {txnData && <p>{timeAgo(txnData?.timestamp)}</p>}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Txn Hash</div>
                {!txnDataLoading && (
                  <div className=" break-words hidden lg:block">
                    {txnData?.id}
                  </div>
                )}
                {!txnDataLoading && txnData?.id && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(txnData?.id)}
                  </div>
                )}
                {txnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Signer</div>
                {!txnDataLoading && (
                  <Link
                    href={`/celestia/${txnData?.signerId?.startsWith('"') ? JSON.parse(txnData?.signerId) : txnData?.signerId}`}
                    className=" break-words hidden lg:block text-primary"
                  >
                    {txnData?.signerId?.startsWith('"')
                      ? JSON.parse(txnData?.signerId)
                      : txnData?.signerId}
                  </Link>
                )}
                {!txnDataLoading && txnData && (
                  <Link
                    href={`/celestia/${txnData?.signerId?.startsWith('"') ? JSON.parse(txnData?.signerId) : txnData?.signerId}`}
                    className=" break-words lg:hidden block text-primary"
                  >
                    {formatAddress(txnData?.signerId)}
                  </Link>
                )}
                {txnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid border-b  border-base-200 lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Timestamp </div>
                {!txnDataLoading && (
                  <div className=" break-words">
                    {new Date(txnData?.timestamp)?.toLocaleString()}
                  </div>
                )}

                {txnDataLoading && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Count</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">{totalData?.daCount}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b border-base-200">
                <div className="">Events Count</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData?.nEvents && (
                  <div className="">{txnData?.nEvents}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Txn Fee</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">{totalData?.fees?.toString()} TIA</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Txn Fee USD</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">{totalData?.feesUSD?.toString()} USD</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">{totalData?.daFees?.toString()} TIA</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee USD</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">{totalData?.daFeesUSD?.toString()} USD</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">TIA Price</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
                  <div className="">
                    {new BigNumber(
                      txnData?.blockHeight?.currentNativePrice
                    )?.toString()}
                    USD
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Data Size</div>
                {txnDataLoading && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!txnDataLoading && txnData && (
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

export default SingleTxn;
