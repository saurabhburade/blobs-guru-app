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
import {
  KB_PER_BLOB,
  MAX_BLOBS_TARGET,
  MAX_BLOBS_SIZE_TARGET_AVAIL,
} from "@/configs/constants";
import BigNumber from "bignumber.js";
import MotionNumber from "motion-number";
import { useAvailUtilisation } from "@/hooks/useAvailUtilisation";
const labelOption = {
  show: true,

  formatter: "{c}  {name|{a}}",
  fontSize: 16,
  rich: {
    name: {},
  },
};
const LIMIT = 100;

const AvailDAUtilisation: React.FC = () => {
  const { data: data, loading } = useAvailUtilisation({ limit: LIMIT });

  console.log(`🚀 ~ file: useAvailUtilisation.ts:26 ~ daSubs:`, data);
  const memoOption = useMemo(() => {
    const lastblockNumber = data?.blocks?.at(0)?.id;

    const averageBlobCount = new BigNumber(data?.totalCount)
      .div(data?.blocks?.length)
      .toNumber();
    const averageDataPerBlock = new BigNumber(data?.byteSize)
      .div(data?.blocks?.length)
      .toNumber();
    console.log(
      `🚀 ~ file: AvailDAUtilisation.tsx:41 ~ averageDataPerBlock:`,
      averageDataPerBlock
    );
    const averageDataPerSub = new BigNumber(data?.byteSize)
      .div(data?.totalCount)
      .toNumber();
    const utilisationPercent = new BigNumber(averageDataPerBlock)
      .div(Number(MAX_BLOBS_SIZE_TARGET_AVAIL))
      .multipliedBy(100)
      .toFormat(2);

    const option: EChartsOption = {
      series: [
        {
          type: "gauge",
          center: ["50%", "70%"],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: Number(MAX_BLOBS_SIZE_TARGET_AVAIL) / 1024,
          splitNumber: Number(4),
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
            // show: false,
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
              value: data
                ? Number(((averageDataPerBlock || 0) / 1024).toFixed(2))
                : 0,
            },
          ],
        },
      ],
    };
    return {
      option,
      utilisationPercent,
      averageBlobCount,
      lastblockNumber,
      averageDataPerBlock,
      averageDataPerBlockF: formatBytes(averageDataPerBlock),
      averageDataPerSub,
    };
  }, [data]);
  return (
    <div className="border-base-200 border w-full rounded-lg p-1">
      <div className=" bg-base-100 rounded-lg ">
        <p className="text-xs p-3 border-b border-base-200 w-full">
          Space Utilization [Last {LIMIT} Blocks]
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
              <MotionNumber
                className="text-2xl font-bold"
                value={Number(memoOption?.lastblockNumber) || 0}
              />
            </div>
            <div className="border-l border-base-200 border-b flex flex-col items-center justify-center">
              <p className="opacity-70"> Space Utilization</p>
              <MotionNumber
                className="text-2xl font-bold gap-2"
                value={Number(memoOption?.utilisationPercent) / 100 || 0}
                format={{
                  style: "percent",
                  compactDisplay: "long",
                  minimumFractionDigits: 2,
                }}
              />
            </div>
            <div className="lg:border-l border-base-200 flex flex-col items-center justify-center">
              <p className="opacity-70"> Avg. Size/Block</p>
              <MotionNumber
                className="text-2xl font-bold gap-2"
                value={memoOption?.averageDataPerBlockF?.split(" ")[0] || 0}
                last={() => (
                  <p className="text-2xl font-bold">
                    {" "}
                    {memoOption?.averageDataPerBlockF?.split(" ")[1]}
                  </p>
                )}
              />
            </div>
            <div className="border-l border-base-200 flex flex-col items-center justify-center">
              <p className="opacity-70"> Avg. subs/Block</p>
              <MotionNumber
                className="text-2xl font-bold gap-2"
                value={Number(memoOption?.averageBlobCount) || 0}
                last={() => <p className="text-2xl font-bold"> Subs</p>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailDAUtilisation;
