import { useL2BeatTVLSummary } from "@/hooks/useL2BeatSeries";
import { cn, numberFormater } from "@/lib/utils";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";
import { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  projectId: string;
};
function mapChartData(chart: any) {
  const { types, data } = chart;
  const result = data.map((entry: any) => {
    const obj = {};
    types.forEach((type: any, index: number) => {
      // @ts-ignore
      obj[type] = entry[index];
    });
    return obj;
  });
  return result;
}
function L2BeatTvlStats({ projectId }: Props) {
  const { data, error, isLoading } = useL2BeatTVLSummary({
    projectId,
    duration: "30d",
  });

  const mappedChartValues = useMemo(() => {
    if (data?.data?.chart) {
      const mappedValues = mapChartData(data?.data?.chart);
      return mappedValues?.map((v: any, idx: number) => {
        const prevDayData = mappedValues[idx - 1] || {};

        const { canonical, native, external, timestamp } = v;
        const {
          canonical: prevDayDatacanonical = 0,
          native: prevDayDatanative = 0,
          external: prevDayDataexternal = 0,
          timestamp: prevDayDatatimestamp = 0,
        } = prevDayData;
        const tvl = new BigNumber(canonical)
          .plus(native)
          ?.plus(external)
          .toNumber();
        const tvlChart = new BigNumber((canonical / tvl) * canonical)
          .plus((native / tvl) * native)
          ?.plus((external / tvl) * external)
          .toNumber();
        const formatedTvl = numberFormater.format(tvl);
        const tvlPrevDay = new BigNumber(prevDayDatacanonical)
          .plus(prevDayDatanative)
          ?.plus(prevDayDataexternal)
          .toNumber();
        return {
          tvl,
          formatedTvl,
          tvlPrevDay,
          tvlChange: ((tvl - tvlPrevDay) / tvlPrevDay) * 100,
          tvlChart,
          canonical: canonical,
          canonicalChart: (canonical / tvl) * canonical,
          native: native,
          nativeChart: (native / tvl) * native,
          externalChart: (external / tvl) * external,
          external: external,
          timestamp,
          canonicalPercent: (canonical / tvl) * 100,
          nativePercent: (native / tvl) * 100,
          externalPercent: (external / tvl) * 100,
          canonicalChange:
            ((canonical - prevDayDatacanonical) / prevDayDatacanonical) * 100,
          nativeChange:
            ((native - prevDayDatanative) / prevDayDatanative) * 100,
          externalChange:
            ((external - prevDayDataexternal) / prevDayDataexternal) * 100,
          today: new Date(timestamp * 1000),
          yesterday: new Date(prevDayDatatimestamp * 1000),
          tvlPercent: 100,
        };
      });
    }
    return null;
  }, [data]);
  const totalData = useMemo(() => {
    if (data?.data?.chart) {
      const mappedValues = mapChartData(data?.data?.chart);
      const prevDayData = mappedValues.at(-2);
      const todayDayData = mappedValues.at(-1);
      const { canonical, native, external, timestamp } = todayDayData;
      const {
        canonical: prevDayDatacanonical,
        native: prevDayDatanative,
        external: prevDayDataexternal,
        timestamp: prevDayDatatimestamp,
      } = prevDayData;
      const tvl = new BigNumber(canonical)
        .plus(native)
        ?.plus(external)
        .toNumber();
      const formatedTvl = numberFormater.format(tvl);
      const tvlPrevDay = new BigNumber(prevDayDatacanonical)
        .plus(prevDayDatanative)
        ?.plus(prevDayDataexternal)
        .toNumber();
      return {
        tvl: 1 * tvl,
        formatedTvl,
        tvlPrevDay,
        tvlChange: ((tvl - tvlPrevDay) / tvlPrevDay) * 100,
        canonical: (canonical / tvl) * canonical,
        native: (native / tvl) * native,
        external: (external / tvl) * external,
        // native,
        // external,
        timestamp,
        canonicalPercent: (canonical / tvl) * 100,
        nativePercent: (native / tvl) * 100,
        externalPercent: (external / tvl) * 100,
        canonicalChange:
          ((canonical - prevDayDatacanonical) / prevDayDatacanonical) * 100,
        nativeChange: ((native - prevDayDatanative) / prevDayDatanative) * 100,
        externalChange:
          ((external - prevDayDataexternal) / prevDayDataexternal) * 100,
        today: new Date(timestamp * 1000),
        yesterday: new Date(prevDayDatatimestamp * 1000),
      };
    }
    return null;
  }, [data]);

  if ((!data && !isLoading) || !totalData || isNaN(totalData?.tvl)) {
    return null;
  }
  return (
    <div className=" grid lg:grid-cols-2 bg-base-100 lg:h-[15em] ">
      <div className="p-4 border-r border-base-200/50 ">
        <div className="my-2">
          <p className="text-2xl font-bold p-2">
            TVL $ {totalData?.formatedTvl}{" "}
            <span
              className={cn(
                "text-sm",
                totalData?.tvlChange > 0 ? "text-green-500" : "",
                totalData?.tvlChange < 0 ? "text-error" : ""
              )}
            >
              {" "}
              {Number(totalData?.tvlChange)?.toFixed(2)} %
            </span>
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 py-5">
          <div className=" bg-base-200/30 p-4 space-y-2 rounded-lg">
            <div className="flex items-center gap-2 ">
              <div className="w-5 h-5 bg-purple-700 rounded-lg border border-base-300"></div>
              <p>Canonical</p>
            </div>
            <p className="text-lg font-bold opacity-70">
              $ {numberFormater.format(totalData?.canonical)}
              <span className={cn("text-xs opacity-55")}>
                {" "}
                {Number(totalData?.canonicalPercent)?.toFixed(2)} %
              </span>
            </p>
          </div>
          <div className=" bg-base-200/30 p-4 space-y-2 rounded-lg">
            <div className="flex items-center gap-2 ">
              <div className="w-5 h-5 bg-pink-600 rounded-lg border border-base-300"></div>
              <p>Native</p>
            </div>
            <p className="text-lg font-bold opacity-70">
              $ {numberFormater.format(totalData?.native)}
              <span className={cn("text-xs opacity-55")}>
                {" "}
                {Number(totalData?.nativePercent)?.toFixed(2)} %
              </span>
            </p>
          </div>
          <div className=" bg-base-200/30 p-4 space-y-2 rounded-lg">
            <div className="flex items-center gap-2 ">
              <div className="w-5 h-5 bg-yellow-500 rounded-lg border border-base-300"></div>
              <p>External</p>
            </div>
            <p className="text-lg font-bold opacity-70">
              $ {numberFormater.format(totalData?.external)}
              <span className={cn("text-xs opacity-55")}>
                {" "}
                {Number(totalData?.externalPercent)?.toFixed(2)} %
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="px-10 py-5 min-h-[15em]">
        <TVLChart mappedChartValues={mappedChartValues} />
      </div>
    </div>
  );
}

export default L2BeatTvlStats;

const CustomTooltip = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    const [vPayload] = payload;

    const {
      canonical,
      native,
      external,
      timestamp,
      canonicalPercent,
      nativePercent,
      externalPercent,
    } = vPayload?.payload;
    const tvl = new BigNumber(canonical)
      .plus(native)
      ?.plus(external)
      .toNumber();
    console.log(`🚀 ~ file: L2BeatTvlStats.tsx:220 ~ tvl:`, tvl, canonical);
    const formatedTvl = numberFormater.format(tvl);
    return (
      <div
        className={` bg-base-100 border border-base-200 lg:w-[25em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between w-full text-xs">
          <p className="h-full  flex justify-between w-full">
            {new Date(timestamp * 1000)?.toString()}
          </p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          <div className="h-full  flex justify-between w-full text-md ">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-[#8884d8] rounded-lg border border-base-300"></div>
              <p>TVL</p>
            </div>
            <p className=" font-bold opacity-70 text-lg">$ {formatedTvl}</p>
          </div>
          <hr className="border-base-200" />
          <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-purple-700 rounded-lg border border-base-300"></div>
              <p>Canonical</p>
            </div>
            <p className=" font-bold opacity-70">
              {" "}
              $ {numberFormater.format(canonical)}
            </p>
          </div>
          <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-pink-600 rounded-lg border border-base-300"></div>
              <p>Native</p>
            </div>
            <p className=" font-bold opacity-70">
              {" "}
              $ {numberFormater.format(native)}
            </p>
          </div>
          <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-yellow-500 rounded-lg border border-base-300"></div>
              <p>External</p>
            </div>
            <p className=" font-bold opacity-70">
              {" "}
              $ {numberFormater.format(external)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
const TVLChart = ({ mappedChartValues }: any) => {
  // "timestamp", "native", "canonical", "external", "ethPrice"
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={mappedChartValues?.map((d: any) => {
          return {
            ...d,
            timestampDate: new Date(d?.timestamp * 1000)?.toDateString(),
          };
        })}
        margin={{}}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Legend
          verticalAlign="top"
          content={() => <span className="text-xs">Chain TVL</span>}
        />
        <XAxis dataKey="timestampDate" className="text-xs" axisLine={false} />
        <Tooltip content={CustomTooltip} />
        <Area
          type="monotone"
          dataKey="tvlChart"
          stroke="#8884d8"
          fillOpacity={1}
          fill="none"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="nativeChart"
          stroke="#be185d"
          fill="#be185d"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="canonicalChart"
          stroke="#7e22ce"
          fill="#7e22ce"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="externalChart"
          stroke="#eab308"
          fill="#eab308"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
