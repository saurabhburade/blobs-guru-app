import { useL2BeatTVLSummary } from "@/hooks/useL2BeatSeries";
import { cn, formatBytes, numberFormater } from "@/lib/utils";
import BigNumber from "bignumber.js";
import _ from "lodash";
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
const dateFormater = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});
const dayFormater = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});
function DAThroughputsChart({
  lastHourDataEigen,
  dEigen,
  lastHourDataCelestia,
  dCelestia,
  dEip4844,
  lastHourDataEIP4844,
}: any) {
  const chartDataEigen = useMemo(() => {
    if (!dEigen?.data) {
      return [];
    }
    const datas = dEigen?.data?.series?.map((bd: any) => {
      console.log(`🚀 ~ file: DAThroughputsChart dEigen.tsx:59 ~ bd:`, bd);
      return {
        ...bd,
        valueF: new BigNumber(bd?.value).toFormat(4),
        valueEigenF: new BigNumber(bd?.value).toFormat(4),
        valueEigen: new BigNumber(bd?.value).toNumber(),
        hourId: parseInt((bd?.timestamp / 3600).toString()),
        timestampF: new Date(Number(bd?.timestamp) * 1000).toUTCString(),
        timestamp3: dayFormater.format(new Date(Number(bd?.timestamp) * 1000)),
      };
    });
    return datas;
  }, [dEigen?.data]);
  const chartDataCelestia = useMemo(() => {
    console.log(
      `🚀 ~ file: DAThroughputsChart.tsx:70 ~ dCelestia:`,
      dCelestia?.data?.series
    );
    if (!dCelestia?.data) {
      return [];
    }
    const datas = dCelestia?.data?.series?.map((bd: any) => {
      return {
        ...bd,
        valueF: new BigNumber(bd?.value).toFormat(4),
        valueCelestiaF: new BigNumber(bd?.value).toFormat(4),
        valueCelestia: new BigNumber(bd?.value).toNumber(),
        hourId: parseInt(
          (new Date(bd?.timestamp).getTime() / 3600000).toString()
        ),
        timestampF: new Date(bd?.timestamp).toUTCString(),
        timestamp3: dayFormater.format(new Date(bd?.timestamp)),
      };
    });
    return datas;
  }, [dCelestia?.data]);
  const chartDataEip4844 = useMemo(() => {
    if (!dEip4844?.blobsHourDatas) {
      return [];
    }
    console.log(`🚀 ~ file: DAThroughputsChart.tsx:93 ~ bd:`, dEip4844);
    const datas = dEip4844?.blobsHourDatas
      ?.map((bd: any) => {
        console.log(`🚀 ~ file: DAThroughputsChart.tsx:107 ~ bd:`, bd);
        return {
          ...bd,
          sizeValue: Number(bd?.totalBlobGas),
          sizeValueEth: new BigNumber(Number(bd?.totalFeeEth))
            .div(1e18)
            .toFormat(8),
          Size: formatBytes(Number(bd?.totalBlobGas)),
          timestamp: dateFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          timestamp2: dayFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          timestampF: new Date(
            Number(bd?.hourStartTimestamp) * 1000
          ).toUTCString(),
          timestamp3: dayFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),

          valueF: new BigNumber(Number(bd?.totalBlobGas))
            .div(1024)
            .div(1024)
            .div(3600)
            .toFormat(4),
          value: new BigNumber(Number(bd?.totalBlobGas))
            .div(1024)
            .div(1024)
            .div(3600)

            .toNumber(),
          valueEIP4844F: new BigNumber(Number(bd?.totalBlobGas))
            .div(1024)
            .div(1024)
            .div(3600)
            .toFormat(4),
          valueEIP4844: new BigNumber(Number(bd?.totalBlobGas))
            .div(1024)
            .div(1024)
            .div(3600)

            .toNumber(),
          hourId: parseInt((Number(bd?.hourStartTimestamp) / 3600).toString()),
        };
      })
      ?.reverse();
    return datas;
  }, [dEip4844?.blobsHourDatas]);
  const mergedData = useMemo(() => {
    if (chartDataCelestia && chartDataEip4844 && chartDataEigen) {
      const mergedData = _.merge(
        chartDataCelestia,
        chartDataEip4844,
        chartDataEigen
      );
      const sortedData = _.orderBy(mergedData, ["timestampF"], ["asc"]);
      console.log(
        `🚀 ~ file: DAThroughputsChart.tsx:164 ~ sortedData:`,
        sortedData
      );
      return sortedData;
    }
    return [];
  }, [chartDataCelestia, chartDataEip4844, chartDataEigen]);
  console.log(`🚀 ~ file: DAThroughputsChart.tsx:165 ~ chartDataCelestia:`, {
    chartDataCelestia,
    chartDataEip4844,
    chartDataEigen,
  });
  const combinedValues = useMemo(() => {
    console.log(
      `🚀 ~ file: DAThroughputsChart.tsx:172 ~ lastHourDataCelestia:`,
      { lastHourDataCelestia, lastHourDataEigen, lastHourDataEIP4844 }
    );
    if (lastHourDataEIP4844 && lastHourDataCelestia && lastHourDataEigen) {
      const totalThroughput = new BigNumber(lastHourDataCelestia?.value || 0)
        ?.plus(lastHourDataEigen?.value || 0)
        ?.plus(lastHourDataEIP4844?.value || 0);
      const celestiaPercent = new BigNumber(lastHourDataCelestia?.value)
        .div(totalThroughput)
        .multipliedBy(100)
        .toFixed(4);
      const eigenPercent = new BigNumber(lastHourDataEigen?.value)
        .div(totalThroughput)
        .multipliedBy(100)
        .toFixed(4);
      const eip4844Percent = new BigNumber(lastHourDataEIP4844?.value)
        .div(totalThroughput)
        .multipliedBy(100)
        .toFixed(4);
      return {
        totalThroughput: totalThroughput?.toFixed(4),
        eip4844Percent,
        eigenPercent,
        celestiaPercent,
      };
    }
    return {};
  }, [lastHourDataEigen, lastHourDataCelestia, lastHourDataEIP4844]);
  console.log(
    `🚀 ~ file: DAThroughputsChart.tsx:171 ~ combinedValues:`,
    combinedValues
  );

  return (
    <div className="  lg:h-[20em] w-full ">
      <div className="lg:h-[20em]  flex-wrap lg:flex-nowrap flex items-stretch gap-4 my-4  w-full ">
        <div className="p-5 h-[20em] bg-base-100/50 border  space-y-7   border-base-300/20 w-full rounded-lg">
          <p>DA throughput</p>

          <div className="flex flex-col justify-center space-y-7 ">
            {/* <div className="flex gap-2 items-center">
              <img
                src="/images/eigenda.png"
                className="rounded-lg w-[30px] h-fit"
                alt=""
              />
              <div
                className="h-[2.5em]  bg-[blue] rounded-r-lg"
                style={{
                  width: combinedValues?.eigenPercent + "%",
                }}
              ></div>
              <p className=" text-xs"> {lastHourDataEigen?.valueF} MiB/sec</p>
            </div> */}
            <div className="flex gap-2 items-center">
              <img
                src="/images/celestia.webp"
                className="rounded-lg w-[30px] h-fit"
                alt=""
              />
              <div
                className="h-[2.5em]  bg-[green]  rounded-r-lg"
                style={{
                  width: combinedValues?.celestiaPercent + "%",
                }}
              ></div>
              <p className=" text-xs">
                {" "}
                {lastHourDataCelestia?.valueF} MiB/sec
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <img
                src="/images/logox.jpeg"
                className="rounded-lg w-[30px] h-fit"
                alt=""
              />
              <div
                className="h-[2.5em]  bg-current  rounded-r-lg"
                style={{
                  width: combinedValues?.eip4844Percent + "%",
                }}
              ></div>
              <p className=" text-xs"> {lastHourDataEIP4844?.valueF} MiB/sec</p>
            </div>
          </div>
        </div>
        <div className="p-5  h-[20em] bg-base-100/50 border border-base-300/20 w-full  rounded-lg">
          {/* <BlobTransactionDayChart /> */}
          <ThroughputChart mergedData={mergedData} />
        </div>
      </div>
    </div>
  );
}

export default DAThroughputsChart;

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
      valueCelestiaF,
      valueEIP4844,
      valueCelestia,
      valueEigenF,
      timestampF,

      valueEIP4844F,
    } = vPayload?.payload;
    const tvl = new BigNumber(canonical)
      .plus(native)
      ?.plus(external)
      .toNumber();

    const formatedTvl = numberFormater.format(tvl);
    return (
      <div
        className={` bg-base-100 border border-base-200 lg:w-[25em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between w-full text-xs">
          <p className="h-full  flex justify-between w-full">{timestampF}</p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          {/* <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-[blue] rounded-lg border border-base-300"></div>
              <p>EigenDA</p>
            </div>
            <p className=" font-bold opacity-70"> {valueEigenF} MiB/sec</p>
          </div> */}
          <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-current rounded-lg border border-base-300"></div>
              <p>EIP 4844</p>
            </div>
            <p className=" font-bold opacity-70"> {valueEIP4844F} MiB/sec</p>
          </div>
          <div className="h-full  flex justify-between w-full text-md">
            <div className="flex items-center gap-2 ">
              <div className="w-3 h-3 bg-[green] rounded-lg border border-base-300"></div>
              <p>Celestia</p>
            </div>
            <p className=" font-bold opacity-70"> {valueCelestiaF} MiB/sec</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
const ThroughputChart = ({ mergedData }: any) => {
  // "timestamp", "native", "canonical", "external", "ethPrice"
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart width={500} height={400} data={mergedData} margin={{}}>
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
          content={() => <span className="text-xs">DA Compare 24Hrs</span>}
        />
        <XAxis dataKey="timestamp2" className="text-xs" axisLine={false} />

        <Tooltip content={CustomTooltip} />
        {/* <Area
          type="monotone"
          dataKey="valueEigen"
          stroke="blue"
          fillOpacity={1}
          fill="none"
          strokeWidth={2}
        /> */}
        <Area
          type="monotone"
          dataKey="valueCelestia"
          stroke="green"
          fill="none"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="valueEIP4844"
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
