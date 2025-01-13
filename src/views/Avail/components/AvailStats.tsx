import { BLOCK_DURATION_SEC, SYNC_START_BLOCK } from "@/configs/constants";
import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_COLLECTIVE_STAT_QUERY,
  AVAIL_DA_COST_DATAS_QUERY,
} from "@/lib/apollo/queriesAvail";
import { formatBytes, formatWrapedText } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import MotionNumber from "motion-number";
import React from "react";
import { useMemo } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAvailDaAppsDataBasic } from "@/hooks/useAvailDaAppsDataBasic";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { BLOB_TRANSACTIONS_DA_COST_QUERY } from "@/lib/apollo/queries";
import { useDaCostCompare } from "@/hooks/useDaCostCompare";
import { InfoIcon } from "lucide-react";

type Props = {};

function AvailStats({}: Props) {
  const { data: appsData } = useAvailDaAppsDataBasic();
  const { data: daCostData, loading: daCostDataLoading } = useDaCostCompare();
  const { data: rawData, loading: statsLoading } = useQuery(
    AVAIL_COLLECTIVE_STAT_QUERY,
    {
      client: availClient,
      pollInterval: 3_000,
    }
  );
  const data = useMemo(() => {
    if (rawData?.collectiveData?.nodes?.length > 0) {
      return {
        collectiveData: rawData?.collectiveData?.nodes[0],
      };
    }
    return null;
  }, [rawData]);

  const dataSize = useMemo(() => {
    if (data?.collectiveData?.totalByteSize) {
      return formatBytes(Number(data?.collectiveData?.totalByteSize));
    }
    return "0 KB";
  }, [data]);
  const totalFeesAvail = useMemo(() => {
    const totalFeeAvailBn = new BigNumber(
      data?.collectiveData?.totalFees
    ).toNumber();
    return totalFeeAvailBn || 0;
  }, [data?.collectiveData?.totalFees]);
  const totalDAFees = useMemo(() => {
    const bn = new BigNumber(data?.collectiveData?.totalDAFees).toNumber();
    return bn || 0;
  }, [data?.collectiveData?.totalDAFees]);
  const totalDAFeesUSD = useMemo(() => {
    const bn = new BigNumber(data?.collectiveData?.totalDAFeesUSD).toNumber();
    return bn || 0;
  }, [data?.collectiveData?.totalDAFeesUSD]);
  const totalDataSubmissionCount = useMemo(() => {
    return data?.collectiveData?.totalDataSubmissionCount;
  }, [data?.collectiveData?.totalDataSubmissionCount]);
  const lastPriceFeed = useMemo(() => {
    return data?.collectiveData?.lastPriceFeed;
  }, [data?.collectiveData?.lastPriceFeed]);
  const totalBlocksCount = useMemo(() => {
    return data?.collectiveData?.totalBlocksCount;
  }, [data?.collectiveData?.totalBlocksCount]);
  const totalDataBlocksCount = useMemo(() => {
    return data?.collectiveData?.totalDataBlocksCount;
  }, [data?.collectiveData?.totalDataBlocksCount]);
  const endBlock = useMemo(() => {
    return data?.collectiveData?.endBlock;
  }, [data?.collectiveData?.endBlock]);
  const totalExtrinsicCount = useMemo(() => {
    const bn = new BigNumber(
      data?.collectiveData?.totalExtrinsicCount
    ).toNumber();
    return bn || 0;
  }, [data?.collectiveData?.totalExtrinsicCount]);
  const blockData = useReactQuery({
    queryKey: ["avail-latest-block"],
    queryFn: async () => {
      const res = await axios.get(
        "https://api.lightclient.mainnet.avail.so/v1/latest_block"
      );
      return res.data;
    },
    refetchInterval: 10_000,
  });
  const percent = useMemo(() => {
    if (blockData?.data?.latest_block && endBlock) {
      const percent = new BigNumber(Number(endBlock))
        .div(blockData?.data?.latest_block)
        .multipliedBy(100)
        .toFormat();
      return percent;
    }
    return 0;
  }, [blockData?.data, endBlock]);
  return (
    <>
      <div className="grid lg:grid-cols-4  gap-4">
        {appsData?.formattedOp?.map((app, idx) => {
          return (
            <div
              key={`${app?.id}----${app?.name}--${idx}`}
              className="p-5 bg-base-200/15 rounded-lg space-y-3"
            >
              <div className="flex gap-3">
                <ImageWithFallback
                  src={
                    app?.logoUri ||
                    `https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`
                  }
                  width={24}
                  height={24}
                  alt=""
                  className="rounded-lg"
                />
                {/* <p className="opacity-70">[{app?.id}]</p> */}
                {app?.name && (
                  <Link
                    href={`/avail/apps/${app?.id}`}
                    className="text-primary"
                  >
                    {formatWrapedText(app?.name, 6, 9)}
                  </Link>
                )}
              </div>
              <hr className="border-base-200/50" />
              <div className="flex gap-2 justify-between">
                <p className="">Size</p>
                <p className="">{formatBytes(app?.byteSize)}</p>
              </div>
              <div className="flex gap-2 justify-between">
                <p className="">Fees</p>
                <p className="">
                  {new BigNumber(app?.fees).toFormat(2)}{" "}
                  <span className="">AVAIL</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-4 gap-0 rounded-lg  w-full ">
        <StatCard
          title="Last block"
          value={endBlock}
          isLoading={statsLoading}
        />

        {/* <StatCard
          title="Total Blocks"
          value={totalBlocksCount}
          isLoading={statsLoading}
        />
        <StatCard
          title="Block Error"
          value={endBlock - totalBlocksCount}
          // after={new Date(data?.collectiveData?.timestampLast).toString()}
          isLoading={statsLoading}
        /> */}

        <StatCard
          title="Txn Fees"
          value={totalFeesAvail}
          isLoading={statsLoading}
          after="AVAIL"
        />
        {/* <StatCard
          title="Sync"
          value={percent}
          isLoading={statsLoading}
          after="%"
        />
        <StatCard
          title="Target"
          value={blockData?.data?.latest_block}
          isLoading={blockData?.isLoading}
        /> */}
        <StatCard
          title="Total data"
          value={dataSize?.split(" ")[0]}
          isLoading={statsLoading}
          after={dataSize?.split(" ")[1]}
        />

        <StatCard
          title="Total ext"
          value={totalExtrinsicCount}
          isLoading={statsLoading}
        />

        <StatCard
          title="DA Submissions"
          value={totalDataSubmissionCount}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total DA Fees"
          value={totalDAFees}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total DA Fees [usd]"
          value={totalDAFeesUSD}
          isLoading={statsLoading}
        />
        {/* <StatCard
          title="Total DA Blocks"
          value={totalDataBlocksCount}
          isLoading={statsLoading}
        /> */}
        <StatCard
          title="Last Avail Price"
          value={lastPriceFeed?.availPrice}
          isLoading={statsLoading}
        />

        {!daCostDataLoading && (
          <>
            <div className=" h-full w-full bg-base-100 border-[0.5px] p-4 space-y-1.5 border-base-200">
              <div className="flex justify-between items-center">
                <p className=" text-sm opacity-50">
                  {"Cost per MB [EIP 4844]"}
                </p>
                <div
                  className="tooltip before:bg-base-100 before:border-base-200/50 before:!border before:text-current"
                  data-tip="Based on last 100 DA submissions"
                >
                  <InfoIcon className="opacity-50 w-[18px] h-[18px]" />
                </div>
              </div>

              <p>
                {Number(daCostData?.totalDataEth?.costPerMb)?.toFixed(4)} ETH
              </p>
              <p className="text-xs opacity-70">
                {Number(daCostData?.totalDataEth?.costPerMbUSD)?.toFixed(4)} USD
              </p>
            </div>
            <div className=" h-full w-full bg-base-100 border-[0.5px] p-4 space-y-1.5 border-base-200">
              <div className="flex justify-between items-center">
                <p className=" text-sm opacity-50">{"Cost per MB [AvailDA]"}</p>

                <div
                  className="tooltip before:bg-base-100 before:border-base-200/50 before:!border before:text-current"
                  data-tip="Based on last 100 DA submissions"
                >
                  <InfoIcon className="opacity-50 w-[18px] h-[18px]" />
                </div>
              </div>

              <p>
                {Number(daCostData?.totalDataAvail?.costPerMb)?.toFixed(4)}{" "}
                AVAIL
              </p>
              <p className="text-xs opacity-70">
                {Number(daCostData?.totalDataAvail?.costPerMbUSD)?.toFixed(4)}{" "}
                USD
              </p>
            </div>
          </>
        )}

        {/* <StatCard
          title="Last ETH Price"
          value={lastPriceFeed?.ethPrice}
          isLoading={statsLoading}
        />
        <div className="lg:col-span-2 h-full w-full bg-base-100 border-[0.5px] p-4 space-y-2 border-base-200">
          <p className=" text-sm opacity-50">{"Last update"}</p>
          <p>{new Date(data?.collectiveData?.timestampLast).toUTCString()}</p>
          <progress
            className="progress progress-info w-3/4 h-1"
            value={Number(percent)}
            max="100"
          ></progress>
        </div> */}
      </div>
    </>
  );
}

export default AvailStats;

const StatCard = ({
  title,
  value,
  isLoading,
  after,
}: {
  title: string;
  after?: string;
  value: string | number | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="h-full w-full bg-base-100 border p-4  border-[0.5px]  space-y-2 border-base-200 animate-pulse">
        <p className=" text-sm opacity-50 h-5 w-20 rounded-full bg-base-200 animate-pulse"></p>
        <p className=" text-sm opacity-50 h-8 w-32 rounded-full bg-base-200 animate-pulse"></p>
      </div>
    );
  }
  return (
    <div className="h-full w-full bg-base-100 border-[0.5px] p-4 space-y-2 border-base-200">
      <p className=" text-sm opacity-50">{title || "Block Height"}</p>
      <MotionNumber
        className="text-2xl font-bold gap-1"
        value={value!}
        last={() => after && <p className="text-2xl font-bold"> {after}</p>}
      />
    </div>
  );
};
