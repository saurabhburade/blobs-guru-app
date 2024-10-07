import { BLOB_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import React, { PureComponent } from "react";
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

export default function BlobTransactionDayChart() {
  const { data } = useQuery(BLOB_DAY_DATAS_QUERY);
  console.log(`🚀 ~ file: BlobTransactionDayChart.tsx:63 ~ data:`, data);
  return (
    <div className="h-full w-full bg-base-100 row-span-2 ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={300} data={data?.blobsDayDatas}>
          <Tooltip />
          <Legend
            verticalAlign="top"
            content={() => (
              <span className="text-xs">Last 10 days Blob transactions</span>
            )}
          />
          <Bar
            dataKey="totalBlobTransactionCount"
            fill="#8884d8"
            radius={10}
            activeBar={<Rectangle radius={10} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
