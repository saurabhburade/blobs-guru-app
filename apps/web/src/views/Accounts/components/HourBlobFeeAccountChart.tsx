import ChartLoading from "@/components/Skeletons/ChartLoading";
import {
  ACCOUNT_DAY_DATAS_QUERY,
  ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY,
  ACCOUNT_HOUR_DATAS_WITH_DURATION_QUERY,
  BLOB_DAY_DATAS_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { formatAddress, formatBytes } from "@/lib/utils";
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

// const data = [
//   {
//     name: "Page A",
//     uv: 4000,
//     pv: 2400,
//     amt: 2400,
//   },
//   {
//     name: "Page B",
//     uv: 3000,
//     pv: 1398,
//     amt: 2210,
//   },
//   {
//     name: "Page C",
//     uv: 2000,
//     pv: 9800,
//     amt: 2290,
//   },
//   {
//     name: "Page D",
//     uv: 2780,
//     pv: 3908,
//     amt: 2000,
//   },
//   {
//     name: "Page E",
//     uv: 1890,
//     pv: 4800,
//     amt: 2181,
//   },
//   {
//     name: "Page F",
//     uv: 2390,
//     pv: 3800,
//     amt: 2500,
//   },
//   {
//     name: "Page G",
//     uv: 3490,
//     pv: 4300,
//     amt: 2100,
//   },
// ];
const getPath = (
  x: number,
  y: number,
  width: number,
  height: number
): string => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};
const TriangleBar = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};
const dayFormater = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function HourBlobFeeAccountChart({
  account,
  duration,
}: {
  account: string;
  duration: number;
}) {
  const { data, loading } = useQuery(ACCOUNT_HOUR_DATAS_WITH_DURATION_QUERY, {
    variables: {
      address: account,
      duration: duration,
    },
  });

  const chartData = useMemo(() => {
    const datas = data?.accountHourDatas
      ?.map((bd: any) => {
        const formatter = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
        });
        const day = formatter.format(
          new Date(Number(bd?.hourStartTimestamp) * 1000)
        );

        return {
          ...bd,
          sizeValue: bd?.totalBlobGas,
          Size: formatBytes(Number(bd?.totalBlobGas)),
          formattedAddress: formatAddress(bd?.account?.id),
          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
          timestamp: dateString.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          timestamp2: formatDateDDMM(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          timestamp3: dayFormater.format(
            new Date(Number(bd?.hourStartTimestamp) * 1000)
          ),
          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobGasEth: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toNumber(),
          totalBlobGasEthFormat: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toFormat(5),
          totalBlobGasUSDFormat: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(5),
          costPerKiB: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e19)
            .div(Number(bd?.totalBlobGas))
            .multipliedBy(1024)
            .toFormat(5),
        };
      })
      ?.reverse();
    return datas;
  }, [data?.accountHourDatas]);
  const cumulativeData = useMemo(() => {
    const datas = data?.accountHourDatas
      ?.map((bd: any) => {
        return {
          ...bd,

          totalBlobGas: Number(bd?.totalBlobGas),

          totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),

          totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
          totalBlobGasEth: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toNumber(),
          totalBlobGasEthFormat: new BigNumber(Number(bd?.totalBlobGasEth))
            .div(1e18)
            .toFormat(5),
          totalBlobGasUSDFormat: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toFormat(5),
          totalBlobGasUSD: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e18)
            .toNumber(),

          costPerKiB: new BigNumber(Number(bd?.totalBlobGasUSD))
            .div(1e19)
            .div(Number(bd?.totalBlobGas))
            .multipliedBy(1024)
            .toFormat(5),
        };
      })
      ?.reverse();
    const totalBlobHashesCount = _.sumBy(datas, "totalBlobHashesCount");
    const totalBlobGasEth = _.sumBy(datas, "totalBlobGasEth");
    const totalBlobGasUSD = _.sumBy(datas, "totalBlobGasUSD");

    const totalBlobTransactionCount = _.sumBy(
      datas,
      "totalBlobTransactionCount"
    );
    const sizeValue = _.sumBy(datas, "sizeValue");
    const size = _.sumBy(datas, "totalBlobGas");
    return {
      totalBlobHashesCount: new BigNumber(totalBlobHashesCount).toFormat(),
      totalBlobGasUSD: new BigNumber(totalBlobGasUSD).toFormat(),
      totalBlobGasEth: new BigNumber(totalBlobGasEth).toFormat(4),
      totalBlobTransactionCount,
      sizeValue,
      size: formatBytes(size),
    };
  }, [data?.accountHourDatas]);
  if (loading) {
    return <ChartLoading />;
  }
  return (
    <div className="h-full w-full row-span-2 ">
      <div className="flex justify-between">
        <p className="text-xs">Blob Fees [ETH] </p>
        <p className="text-xs">
          {cumulativeData?.totalBlobGasEth} ETH [{duration} Hrs]
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={100}
          data={chartData}
          margin={{ top: 30, right: 30, left: -30, bottom: 30 }}
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
          {/* <Legend
            verticalAlign="top"
            content={() => <span className="text-xs">Blob Fees</span>}
          /> */}
          <Bar
            dataKey="totalBlobGasEth"
            fill="url(#colorUv)"
            radius={10}
            // @ts-ignore
            // shape={<TriangleBar />}
          ></Bar>
          <YAxis
            className="text-[10px] !text-current"
            allowDataOverflow
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            dataKey="timestamp3"
            className="text-[10px] !text-current"
            angle={45}
            tickLine={false}
            allowDataOverflow
            axisLine={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-100 border border-base-200 lg:w-[20em] py-4 space-y-2 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between w-full ">
          <p className="h-full  flex justify-between w-full">
            {`${payload[0]?.payload?.timestamp}`}
          </p>
        </div>
        <hr className="border-base-200" />
        <div className="px-4 space-y-3">
          {/* <p className=" break-words ">
            Transactions : {`${payload[0]?.payload?.totalBlobTransactionCount}`}
          </p> */}
          <p className=" ">
            Fee ETH: {`${payload[0]?.payload?.totalBlobGasEthFormat}`} ETH
          </p>
          <p className=" ">
            Fee USD: {`${payload[0]?.payload?.totalBlobGasUSDFormat}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
