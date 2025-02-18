import { BLOB_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import { formatDateDDMM } from "@/lib/time";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
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
  Area,
  AreaChart,
  Curve,
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

export default function BlobTransactionDayChart() {
  const { data } = useQuery(BLOB_DAY_DATAS_QUERY, {
    variables: {
      duration: 15,
    },
  });

  const chartData = useMemo(() => {
    const datas = data?.blobsDayDatas?.map((bd: any) => {
      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        Size: formatBytes(Number(bd?.totalBlobGas)),
        timestamp: new Date(Number(bd?.dayStartTimestamp) * 1000),
        timestamp2: formatDateDDMM(
          new Date(Number(bd?.dayStartTimestamp) * 1000)
        ),
        totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
        totalBlobHashesCount: Number(bd?.totalBlobHashesCount),
        mibPerSecF: new BigNumber(Number(bd?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(86400)
          .toFormat(4),
        mibPerSec: new BigNumber(Number(bd?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(86400)

          .toNumber(),
      };
    });
    return datas?.reverse();
  }, [data?.blobsDayDatas]);
  return (
    <div className="h-full w-full  row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={500} height={400} data={chartData} margin={{}}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs">Throughput [MiB/sec]</span>
            )}
          />
          <XAxis
            tickCount={7}
            dataKey="timestamp2"
            className="text-xs"
            axisLine={false}
            includeHidden={true}
            angle={45}
            tickLine={false}
          />
          <Tooltip content={CustomTooltipRaw} />
          <Area
            type="monotone"
            dataKey="mibPerSec"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
            strokeWidth={2}

            // TODO: make it generic & reusable
            strokeDasharray="300 3 10 3  10 3  10 3  10 3  10 3  10 3  10 3  10 1  10 1  10 1 10 1  10 1  10 1  10 1  10 1  10 1  10 1  10 1"
          >
            {chartData?.map((_: any, index: number) => (
              <Curve type={"step"} key={`cell-${index}`} />
            ))}
            {/* <Curve type={"step"} /> */}
          </Area>
        </AreaChart>
        {/* <BarChart width={500} height={300} data={chartData}>
          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs">Last 15 days Blob transactions</span>
            )}
          />
          <Bar
            dataKey="totalBlobTransactionCount"
            fill="#8884d8"
            // @ts-ignore
            shape={<TriangleBar />}
          >
            {chartData?.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>

          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />
          <XAxis dataKey="timestamp2" className="text-xs" />
        </BarChart> */}
      </ResponsiveContainer>
    </div>
  );
}
const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-200 w-[18em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">
            Throughput: {`${payload[0]?.payload?.mibPerSecF} MiB/sec`}
          </p>
          <p className=" ">
            Blobs: {`${payload[0]?.payload?.totalBlobHashesCount}`}
          </p>
          <p className="  ">
            Timestamp: {`${payload[0]?.payload?.timestamp2}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
