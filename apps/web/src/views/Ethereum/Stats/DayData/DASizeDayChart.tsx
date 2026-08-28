import ChartLoading from "@/components/Skeletons/ChartLoading";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { apolloClient } from "@/lib/apollo/client";
import {
  ACCOUNT_DAY_DATAS_QUERY,
  ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
} from "@/lib/apollo/queries";

import { ETHEREUM_DAY_DATAS_WITH_DURATION_WITH_APPS_QUERY } from "@/lib/apollo/queriesEthereum";
import { formatDateDDMM } from "@/lib/time";
import { formatAddress, formatBytes, formatWrapedText } from "@/lib/utils";
import { getAppSeriesColor, getAppSeriesId } from "./chartSeries";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import _ from "lodash";
import React, { PureComponent, useMemo } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const dateString2 = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
});

export default function DASizeDayChart({ duration }: { duration: number }) {
  const { data, loading, error } = useQuery(
    ETHEREUM_DAY_DATAS_WITH_DURATION_WITH_APPS_QUERY,
    {
      variables: {
        duration: duration,
        limit: 5,
      },
      client: apolloClient,
    },
  );

  const chartDataFormated = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.collectiveDayData?.nodes
      ?.map((rawData: any) => {
        const day = formatter.format(new Date(rawData?.timestampStart));

        return {
          appDayDataParticipant: rawData?.appDayDataParticipantOthers
            ?.aggregates?.sum
            ? {
                ...rawData?.appDayDataParticipant,
                nodes: [
                  {
                    ...rawData?.appDayDataParticipantOthers?.aggregates?.sum,
                    appId: "Other",
                  },
                  ...rawData?.appDayDataParticipant?.nodes,
                ],
              }
            : rawData?.appDayDataParticipant,
          appDayDataParticipantOthers: rawData?.appDayDataParticipantOthers,
          timestampF: dateString.format(new Date(rawData?.timestampStart)),
          timestamp3: dateString2.format(new Date(rawData?.timestampStart)),
          timestamp2: new Date(rawData?.timestampStart).toDateString(),
        };
      })
      ?.reverse();

    const keys = (datas as any[])?.map((e) => {
      return e?.appDayDataParticipant?.nodes?.map((v: any) =>
        getAppSeriesId(v?.appId),
      );
    });
    const keysSet = _.uniq(_.flatten(keys));

    const accountDayDataParticipants = datas?.map(
      (e: any) => e?.appDayDataParticipant?.nodes,
    );

    const chartDataList = [];
    let sum = 0;
    for (let index = 0; index < accountDayDataParticipants?.length; index++) {
      const accList = accountDayDataParticipants[index];
      const accDayDatasMap = {};
      for (let idx = 0; idx < accList?.length; idx++) {
        const accDayData = accList[idx];
        if (accDayData) {
          const seriesId = getAppSeriesId(accDayData?.appId);
          // @ts-ignore
          accDayDatasMap[seriesId] = new BigNumber(
            // @ts-ignore
            accDayDatasMap[seriesId] ?? 0,
          )
            .plus(accDayData?.totalByteSize ?? 0)
            .toNumber();
          sum += Number(accDayData?.totalByteSize);
        }
      }

      const dayData = datas[index];
      const rawChartData = {
        ...dayData,
        ...accDayDatasMap,
        appDayDataParticipant: null,
      };
      chartDataList.push(rawChartData);
    }

    return {
      chartDataList,
      keys: keysSet,
    };
  }, [data?.collectiveDayData]);
  const cumulativeData = useMemo(() => {
    const totalDataSubmissionCount = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalDataSubmissionCount",
    );
    const totalExtCount = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalTxnCount",
    );
    const totalByteSize = _.sumBy(
      data?.collectiveDayData?.nodes,
      "totalByteSize",
    );

    return {
      totalDataSubmissionCountF: new BigNumber(
        totalDataSubmissionCount,
      ).toFormat(),
      totalDataSubmissionCount,
      totalExtCountF: new BigNumber(totalExtCount).toFormat(),
      totalExtCount,
      totalByteSize,
      totalByteSizeF: formatBytes(Number(totalByteSize)),
    };
  }, [data?.collectiveDayData]);

  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="h-full w-full row-span-2 ">
      <div className="flex justify-between">
        <p className="text-xs">Byte Size </p>
        <p className="text-xs">
          {cumulativeData?.totalByteSizeF} [{duration} days]
        </p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={100}
          data={chartDataFormated?.chartDataList}
          margin={{ top: 30, right: 20, left: -20, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />
          {/* <Bar
            dataKey="sizeValue"
            stackId="d"
            fill="url(#colorUv)"
            radius={10}
          ></Bar> */}
          {[...(chartDataFormated?.keys ?? [])].reverse().map((key) => {
            return (
              <Bar
                key={key}
                dataKey={key}
                fill={getAppSeriesColor(key)}
                stackId="a"
                radius={[0, 0, 0, 0]}
              ></Bar>
            );
          })}

          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              const [num, denom] = formatBytes(v, 1).split(" ");
              return `${Number(num).toFixed(0)} ${denom}`;
            }}
          />
          <XAxis
            dataKey="timestamp3"
            className="text-[10px] !text-current"
            angle={-60}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
            tickMargin={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  // const kv = _.last(_.toPairs(payload[0]?.payload));
  if (active && payload && payload.length) {
    const sortedPayload = _.orderBy(payload, ["value"], ["desc"])?.map((v) => {
      const appName = getAccountDetailsFromAddressBook(
        (v?.name as string)?.toLowerCase()?.split("-")[0],
      );
      return {
        ...v,
        name: appName?.name ?? v?.name,
      };
    });
    const total = sortedPayload?.reduce((acc, v) => {
      return acc + Number(v?.value);
    }, 0);
    return (
      <>
        <div
          className={` bg-base-100 border border-base-200 lg:w-[20em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
        >
          <div className="px-4 flex  gap-2 justify-between w-full ">
            <p className="h-full  flex justify-start w-full">
              {`${payload[0]?.payload?.timestamp2}`}
            </p>
            <p className="h-full  flex justify-end w-full">{`${formatBytes(total)}`}</p>
          </div>
          <hr className="border-base-200" />
          <div className="px-4 space-y-3">
            {/* <p className=" ">DA Size : {`${payload[0]?.payload?.size}`}</p> */}

            {sortedPayload?.map((p: any, idx: any) => {
              return (
                <div className="flex items-center gap-2" key={p?.dataKey}>
                  <span
                    className="w-[10px] h-[10px]"
                    style={{
                      backgroundColor: p?.fill,
                    }}
                  ></span>
                  <p className=" " key={p?.dataKey}>
                    {formatWrapedText(p?.name, 5, 5)} :{" "}
                    {`${formatBytes(p?.value)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return null;
};
