"use client";
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  BLOB_BLOCKS_EXPLORER_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import { formatAddress, formatBytes } from "@/lib/utils";
import _ from "lodash";
import { EChartsOption } from "echarts";
import { KB_PER_BLOB, MAX_BLOBS_TARGET } from "@/configs/constants";
import BigNumber from "bignumber.js";
const labelOption = {
  show: true,

  formatter: "{c}  {name|{a}}",
  fontSize: 16,
  rich: {
    name: {},
  },
};
const BlobUtilisation: React.FC = () => {
  const { data, loading } = useQuery(BLOB_BLOCKS_EXPLORER_QUERY, {
    variables: {
      skip: 1,
      limit: 10,
    },
    pollInterval: 5_000, // Every 10 sec
  });

  const memoOption = useMemo(() => {
    let lastblockNumber = 0;
    const datas = data?.blobBlockDatas?.map((bd: any) => {
      lastblockNumber = Number(bd?.blockNumber);
      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        Size: formatBytes(Number(bd?.totalBlobGas)),
        formattedAddress: formatAddress(bd?.id),
        value: bd?.totalBlobTransactionCount,
        name: formatAddress(bd?.id),
      };
    });
    console.log(`🚀 ~ file: BlobUtilisation.tsx:30 ~ datas:`, datas);
    const averageBlobCount = _.meanBy(datas, function (o: any) {
      return Number(o?.totalBlobTransactionCount);
    });
    const utilisationPercent = new BigNumber(
      averageBlobCount * Number(KB_PER_BLOB)
    )
      .div(Number(KB_PER_BLOB) * Number(MAX_BLOBS_TARGET))
      .multipliedBy(100)
      .toFormat(2);

    const option: EChartsOption = {
      series: [
        {
          type: "gauge",
          center: ["50%", "60%"],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: Number(KB_PER_BLOB) * Number(MAX_BLOBS_TARGET),
          splitNumber: Number(MAX_BLOBS_TARGET),
          itemStyle: {
            color: "#FFAB91",
          },
          progress: {
            show: true,
            width: 30,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 30,
            },
          },
          axisTick: {
            distance: -45,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: "#999",
            },
          },
          splitLine: {
            distance: -52,
            length: 14,
            lineStyle: {
              width: 3,
              color: "#999",
            },
          },
          axisLabel: {
            distance: -20,
            color: "#999",
            fontSize: 14,
          },
          anchor: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            width: "60%",
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, "-15%"],
            fontSize: 20,
            fontWeight: "bolder",
            formatter: "{value} KiB",
            color: "inherit",
          },
          data: [
            {
              value: averageBlobCount * Number(KB_PER_BLOB),
            },
          ],
        },
      ],
    };
    return { option, utilisationPercent, averageBlobCount, lastblockNumber };
  }, [data?.blobBlockDatas]);
  return (
    <div className="border-base-200 border w-full rounded-lg p-1">
      <div className=" bg-base-100 rounded-lg ">
        <p className="text-xs p-3 border-b border-base-200 w-full">
          Blobs Utilization [Last 10 Blocks]
        </p>{" "}
        <div className="grid lg:grid-cols-2 w-full h-full lg:h-[17em]">
          <div className="h-[17em] w-full p-5">
            <ReactECharts
              option={memoOption?.option}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <div className="grid grid-cols-2  h-[15em] lg:h-full border-t lg:border-t-0 border-base-200">
            <div className="flex flex-col items-center justify-center lg:border-l border-b border-base-200 ">
              <p className="opacity-70"> Block Height</p>
              <p className="text-2xl font-bold">
                {Number(memoOption?.lastblockNumber) || 0}
              </p>
            </div>
            <div className="border-l border-base-200 border-b flex flex-col items-center justify-center">
              <p className="opacity-70"> Space Utilization</p>
              <p className="text-2xl font-bold">
                {Number(memoOption?.utilisationPercent) || 0}%
              </p>
            </div>
            <div className="lg:border-l border-base-200 flex flex-col items-center justify-center">
              <p className="opacity-70"> Avg. Size/Block</p>
              <p className="text-2xl font-bold">
                {memoOption?.averageBlobCount * Number(KB_PER_BLOB)} KiB
              </p>
            </div>
            <div className="border-l border-base-200 flex flex-col items-center justify-center">
              <p className="opacity-70"> Avg. Blobs/Block</p>
              <p className="text-2xl font-bold">
                {Number(memoOption?.averageBlobCount) || 0} BLOBS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlobUtilisation;
