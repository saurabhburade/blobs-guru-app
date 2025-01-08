import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { ETHERSCAN_LINK } from "@/configs/constants";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_BLOCK_QUERY } from "@/lib/apollo/queriesAvail";
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
  blockNumber: number | string;
};

function SingleAvailBlock({ blockNumber }: Props) {
  const {
    data: { block: availBlockData } = {},
    loading: availBlockDataLoadig,
  } = useQuery(AVAIL_BLOCK_QUERY, {
    variables: { id: blockNumber?.toString() },
    client: availClient,
  });

  const totalData = useMemo(() => {
    const reducedData = availBlockData?.extrinsics?.nodes.reduce(
      (acc: any, node: any) => {
        const aggregates = node?.dataSubmissions?.aggregates?.sum || {};

        acc.byteSize += aggregates.byteSize || 0;
        acc.daFees += Number(aggregates.fees) || 0;
        acc.daFeesUSD += aggregates.feesUSD || 0;
        acc.feesUSD +=
          Number(node.fees) * Number(availBlockData?.availPrice) || 0;
        acc.fees += Number(node.fees) || 0;

        acc.daCount += node?.dataSubmissions?.totalCount || 0;

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
  }, [availBlockData]);

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
          <h2 className="lg:text-xl text-xl font-semibold">Avail Block</h2>
        </div>
        {!availBlockDataLoadig && !availBlockData && (
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
        {(availBlockDataLoadig || availBlockData) && (
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
                    {availBlockData && (
                      <p>{timeAgo(availBlockData?.timestamp)}</p>
                    )}
                  </div>
                  <Link href={`/avail/blocks/${Number(blockNumber) - 1}`}>
                    <button className="btn btn-ghost btn-sm w-fit p-1">
                      <ChevronLeft />
                    </button>
                  </Link>
                  <Link href={`/avail/blocks/${Number(blockNumber) + 1}`}>
                    <button className="btn btn-ghost btn-sm p-1">
                      <ChevronRight />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Block Hash</div>
                {!availBlockDataLoadig && (
                  <div className=" break-words hidden lg:block">
                    {availBlockData?.hash}
                  </div>
                )}
                {!availBlockDataLoadig && availBlockData?.hash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(availBlockData?.hash)}
                  </div>
                )}
                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid border-b  border-base-200 lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Timestamp </div>
                {!availBlockDataLoadig && (
                  <div className=" break-words">
                    {new Date(
                      availBlockData?.timestamp + "Z"
                    )?.toLocaleString()}
                  </div>
                )}

                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Parent Hash </div>
                {!availBlockDataLoadig && (
                  <div className=" break-words hidden lg:block">
                    {availBlockData?.parentHash}
                  </div>
                )}
                {!availBlockDataLoadig && availBlockData?.parentHash && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(availBlockData?.parentHash)}
                  </div>
                )}
                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">State Root </div>
                {!availBlockDataLoadig && (
                  <div className=" break-words hidden lg:block">
                    {availBlockData?.stateRoot}
                  </div>
                )}
                {!availBlockDataLoadig && availBlockData?.stateRoot && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(availBlockData?.stateRoot)}
                  </div>
                )}
                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 ">
                <div className="">Runtime Version </div>
                {!availBlockDataLoadig && (
                  <div className=" break-words">
                    {availBlockData?.runtimeVersion}
                  </div>
                )}

                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 gap-4 lg:gap-0 w-full p-5 border-b  border-base-200">
                <div className="">Extrinsics Root </div>
                {!availBlockDataLoadig && (
                  <div className=" break-words hidden lg:block">
                    {availBlockData?.extrinsicsRoot}
                  </div>
                )}
                {!availBlockDataLoadig && availBlockData?.extrinsicsRoot && (
                  <div className=" break-words lg:hidden block">
                    {formatAddress(availBlockData?.extrinsicsRoot)}
                  </div>
                )}
                {availBlockDataLoadig && (
                  <div className=" break-words  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Count</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">{totalData?.daCount}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Extrinsics Count</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.nbExtrinsics && (
                  <div className="">{availBlockData?.nbExtrinsics}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5 border-b border-base-200">
                <div className="">Events Count</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.nbEvents && (
                  <div className="">{availBlockData?.nbEvents}</div>
                )}
              </div>

              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Block Fee</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">{availBlockData?.blockFee?.toString()}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Block Fee USD</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">
                    {new BigNumber(availBlockData?.blockFee)
                      ?.times(availBlockData?.availPrice)
                      ?.toString()}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">AVAIL Price</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">
                    {new BigNumber(availBlockData?.availPrice)?.toString()}
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">{totalData?.daFees?.toString()}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">DA Fee USD</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData?.blockFee && (
                  <div className="">{totalData?.daFeesUSD}</div>
                )}
              </div>
              <div className="grid lg:grid-cols-[0.75fr_3fr] grid-cols-[1.5fr_2.5fr] gap-4 lg:gap-0 w-full p-5">
                <div className="">Data Size</div>
                {availBlockDataLoadig && (
                  <div className=" break-words w-1/3  block bg-base-200/60 h-[1.5em] animate-pulse rounded-lg"></div>
                )}
                {!availBlockDataLoadig && availBlockData && (
                  <div className="">{formatBytes(totalData?.byteSize)}</div>
                )}
              </div>
            </div>
            <div className="my-5">
              <TxnRows
                txns={availBlockData?.extrinsics?.nodes}
                loading={availBlockDataLoadig}
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

export default SingleAvailBlock;

function TxnRows({ txns, loading }: any) {
  return (
    <div className=" bg-base-100 border rounded-lg border-base-200">
      <div className="flex p-4 border-b border-base-200">
        <p> Extrinsics</p>
      </div>
      <div className="hidden xl:grid xl:grid-cols-7 p-4 border-b text-end border-base-200 text-sm items-center">
        <div className="flex items-center gap-2">
          {" "}
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>{" "}
          Ext #
        </div>
        <p>From</p>
        <p>Module</p>
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
  const txFeeAvail = useMemo(() => {
    return new BigNumber(txn?.fees).toFormat(5);
  }, [txn?.fees]);

  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-7 py-4 border-b border-base-200 text-sm items-center text-end last:border-b-0">
        <div className="flex items-center gap-2 text-start">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link href={`/avail/txn/${txn?.id}`} className="text-primary">
              {" "}
              {formatAddress(txn?.id)}
            </Link>

            <p>{timeAgo(new Date(txn.timestamp + "Z"))}</p>
          </div>
        </div>
        {txn?.signer ? (
          <Link
            href={`/avail/${txn?.signer}`}
            className="lg:text-end text-primary"
          >
            {formatAddress(txn?.signer)}
          </Link>
        ) : (
          <p>-</p>
        )}
        {txn?.nbEvents ? (
          <div className="flex justify-end">
            <p className=" p-1 px-2 border border-base-200 rounded-full w-fit -mr-2">
              {txn?.module}
            </p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <p>
            {formatBytes(txn?.dataSubmissions?.aggregates?.sum?.byteSize || 0)}{" "}
          </p>
        </div>
        <div>
          <p>
            <span>{txn?.blockHeight}</span> : {txn?.extrinsicIndex}
          </p>
        </div>

        <div>
          <p>{txFeeAvail} AVAIL</p>
        </div>
        <div>
          <p>{txn?.dataSubmissions?.aggregates?.sum?.fees || 0} AVAIL </p>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-3 flex-wrap xl:hidden gap-2 lg:gap-0 justify-between first:border-t-0 border-t py-3 border-base-200 text-sm">
        <div className="flex items-center gap-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
            <NotepadText strokeWidth="1" width={24} height={24} />
          </div>
          <div>
            <Link href={`/avail/txn/${txn?.id}`} className="text-primary">
              {" "}
              {formatAddress(txn?.id)}
            </Link>

            <p>{timeAgo(new Date(txn.timestamp + "Z"))}</p>
          </div>
        </div>
        <div>
          <p>
            {formatBytes(txn?.dataSubmissions?.aggregates?.sum?.byteSize || 0)}{" "}
          </p>
        </div>
        <div className="hidden  md:block xl:hidden text-end">
          <Link
            href={`/avail/${txn?.signer}`}
            className="lg:text-end text-primary"
          >
            From : {formatAddress(txn?.signer)}
          </Link>
          <p className=" text-end">{txFeeAvail} AVAIL</p>
        </div>
        <div className="flex my-2 md:hidden  lg:my-0 justify-between  w-full  lg:col-span-1 ">
          <Link
            href={`/avail/${txn?.signer}`}
            className="lg:text-end text-primary"
          >
            From : {formatAddress(txn?.signer)}
          </Link>
          <p className=" text-end">{txFeeAvail} AVAIL</p>
        </div>
      </div>
    </>
  );
};
