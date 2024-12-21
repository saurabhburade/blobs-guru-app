import { BLOCK_DURATION_SEC, SYNC_START_BLOCK } from "@/configs/constants";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_COLLECTIVE_STAT_QUERY } from "@/lib/apollo/queriesAvail";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import MotionNumber from "motion-number";
import React from "react";
import { useMemo } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import axios from "axios";

type Props = {};

function AvailStats({}: Props) {
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
    <div className="grid lg:grid-cols-4 gap-0 rounded-lg  w-full ">
      <StatCard title="Last block" value={endBlock} isLoading={statsLoading} />

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
      /> */}
      {/* <StatCard
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
      <StatCard
        title="Total DA Blocks"
        value={totalDataBlocksCount}
        isLoading={statsLoading}
      />
      {/* <StatCard
        title="Last Avail Price"
        value={lastPriceFeed?.availPrice}
        isLoading={statsLoading}
      />
      <StatCard
        title="Last ETH Price"
        value={lastPriceFeed?.ethPrice}
        isLoading={statsLoading}
      /> */}
      {/* <div className="lg:col-span-2 h-full w-full bg-base-100 border-[0.5px] p-4 space-y-2 border-base-200">
        <p className=" text-sm opacity-50">{"Last update"}</p>
        <p>{new Date(data?.collectiveData?.timestampLast).toUTCString()}</p>
        <progress
          className="progress progress-info w-3/4 h-1"
          value={Number(percent)}
          max="100"
        ></progress>
      </div> */}
    </div>
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
