import {
  ACCOUNT_DAY_DATAS_QUERY,
  BLOB_DAY_DATAS_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes } from "@/lib/utils";
import { useQuery } from "@apollo/client";
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
export default function DayTxnsBlobAccountChart({
  account,
}: {
  account: string;
}) {
  const { data } = useQuery(ACCOUNT_DAY_DATAS_QUERY, {
    variables: {
      address: account,
    },
  });

  const chartData = useMemo(() => {
    const datas = data?.accountDayDatas?.map((bd: any) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      });
      const day = formatter.format(
        new Date(Number(bd?.dayStartTimestamp) * 1000)
      );

      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        Size: formatBytes(Number(bd?.totalBlobGas)),
        formattedAddress: formatAddress(bd?.account?.id),
        totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
        timestamp: day,
      };
    });
    return datas;
  }, [data?.accountDayDatas]);
  return (
    <div className="h-full w-full row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={100} data={chartData}>
          <Tooltip
            cursor={{ fill: "var(--fallback-b2, oklch(var(--b2) / 0.3))" }}
            // @ts-ignore
            content={<CustomTooltipRaw />}
          />
          <Legend
            verticalAlign="top"
            content={() => <span className="text-xs">Blob transactions</span>}
          />
          <Bar
            dataKey="totalBlobTransactionCount"
            fill="#8884d8"
            radius={10}
            // @ts-ignore
            shape={<TriangleBar />}
            label={{ position: "top", fontSize: "8px" }}
          ></Bar>
          <XAxis dataKey="timestamp" className="text-xs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-200 w-fit rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" break-words ">
            Transactions : {`${payload[0]?.payload?.totalBlobTransactionCount}`}
          </p>
          <p className=" ">Size: {`${payload[0]?.payload?.Size}`}</p>
        </div>
      </div>
    );
  }

  return null;
};
