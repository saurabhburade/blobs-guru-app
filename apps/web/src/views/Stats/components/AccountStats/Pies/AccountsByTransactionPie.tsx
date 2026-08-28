"use client";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import {
  BLOB_ACCOUNTS_EXPLORER_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import {
  formatAddress,
  formatBytes,
  formatEthereumValue,
  processAccounts,
} from "@/lib/utils";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import _ from "lodash";
import React, { PureComponent, useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
  { name: "Group E", value: 200 },
  { name: "Others", value: 200 },
];
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#FF4C4C", // Red
  "#A569BD", // Purple
  "#1F78B4", // Light Blue
  "#B2DF8A", // Light Green
  "#E31A1C", // Bright Red
  "#FDBF6F", // Tan
];
export default function AccountsByTransactionPie({ collectiveData }: any) {
  const { data, loading } = useQuery(TOP_BLOB_ACCOUNTS_QUERY);

  const chartData = useMemo(() => {
    const processed = processAccounts(data?.accounts);

    let percentageDiff = 100;
    const datas = processed?.map((bd: any, idx: number) => {
      const p = new BigNumber(Number(bd?.totalBlobTransactionCount))
        .div(Number(collectiveData?.totalBlobTransactionCount))
        .multipliedBy(100);

      percentageDiff -= p.toNumber();
      const basicAccountDetail = getAccountDetailsFromAddressBook(bd.id);
      return {
        ...bd,
        sizeValue: Number(bd?.totalBlobGas),
        percent:
          idx === processed?.length - 1
            ? p.plus(percentageDiff).toNumber()
            : p?.toNumber(),
        percentFormat:
          idx === processed?.length - 1
            ? p.plus(percentageDiff).toFormat(2)
            : p?.toFormat(2),
        Size: formatBytes(Number(bd?.totalBlobGas)),
        formattedAddress: bd?.id
          ? basicAccountDetail?.name || formatAddress(bd?.id)
          : "Others",
        name: basicAccountDetail?.name || bd?.id || "Others",
        totalBlobTransactionCount: Number(bd?.totalBlobTransactionCount),
        totalBlobTransactionCountFormat: new BigNumber(
          Number(bd?.totalBlobTransactionCount)
        ).toFormat(),
        totalBlobGasEth: Number(bd?.totalBlobGasEth),
        totalBlobGasEthFormat: formatEthereumValue(Number(bd?.totalBlobGasEth)),
        basicAccountDetail,
      };
    });
    const allExceptLast = _.slice(datas, 0, -1);
    const sorted = _.orderBy(
      allExceptLast,
      [(account) => parseInt(account.totalBlobTransactionCount)],
      ["desc"]
    );

    // Add the last item back to the sorted array
    const lastItem = _.last(datas);

    return [...sorted, lastItem];
  }, [data?.accounts, collectiveData]);
  const [active, setActive] = useState(-1);
  const onPieEnter = (_: any, index: number) => {
    setActive(index);
  };
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <div className="flex  w-full lg:h-[20em] lg:flex-row flex-col-reverse relative top-0">
        <div className="lg:w-[100%] h-full relative top-0 flex items-center lg:items-start justify-center">
          <div className="flex w-full justify-center items-center flex-col ">
            <div className="  flex flex-col items-center justify-center  absolute   rounded-full">
              <p className="font-semibold">
                {" "}
                {new BigNumber(
                  Number(collectiveData?.totalBlobTransactionCount)
                )?.toFormat()}
              </p>
            </div>
            <PieChart width={200} height={200} className=" p-0 my-7">
              <Pie
                cx={"50%"}
                cy={"50%"}
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={0}
                dataKey="totalBlobTransactionCount"
                cornerRadius={5}
                stroke="0"
                activeIndex={active}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                // cornerRadius={5}
                onMouseLeave={() => setActive(-1)}
                onMouseOut={() => setActive(-1)}
                onMouseOutCapture={() => setActive(-1)}
                onTouchEnd={() => setActive(-1)}
                onTouchCancel={() => setActive(-1)}
              >
                {chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip content={CustomTooltipRaw} />
            </PieChart>
          </div>
        </div>
        {loading && (
          <div className=" flex flex-col justify-start lg:px-4 p-2 w-full">
            {new Array(7)?.fill(1)?.map((entry, index) => (
              <div
                key={`account-row-${index}`}
                className="p-2  w-full grid grid-cols-[0.1fr_1fr_1fr] gap-4  rounded-lg flex justify-between  items-center"
              >
                <p className=" size-4 rounded animate-pulse bg-base-200/50"></p>
                <p className="h-[1.2em] rounded animate-pulse bg-base-200/50"></p>
                <p className=" h-[1.2em]  rounded animate-pulse bg-base-200/50"></p>
              </div>
            ))}
          </div>
        )}
        {!loading && (
          <div className=" flex flex-col justify-center px-4">
            {chartData?.map((entry, index) => (
              <div
                key={`account-row-${entry?.id}`}
                className="p-2 hover:bg-base-200/50 rounded-lg flex justify-between  items-center"
                onMouseEnter={() => {
                  setActive(index);
                }}
              >
                <div className="flex items-center gap-2">
                  {entry?.basicAccountDetail?.logoUri ? (
                    <img
                      src={entry?.basicAccountDetail?.logoUri}
                      className="w-[1em] h-[1em] rounded-lg "
                    />
                  ) : (
                    <div className="w-[1em] h-[1em] bg-primary rounded-lg"></div>
                  )}

                  <p className="text-sm w-[60%] whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {entry?.formattedAddress}
                  </p>
                </div>
                <p className="text-xs text-end flex gap-2">
                  <span className="opacity-25">
                    {" "}
                    {entry?.totalBlobTransactionCountFormat}
                  </span>{" "}
                  <span> {entry?.percentFormat}%</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveContainer>
  );
}

const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-200 w-[15em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className="  ">
            Account: {`${payload[0]?.payload?.formattedAddress}`}
          </p>
          <p className=" ">
            Blob fee : {`${payload[0]?.payload?.totalBlobGasEthFormat}`} ETH
          </p>
        </div>
      </div>
    );
  }

  return null;
};
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    amount,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* <text x={cx} y={cy} dy={8} textAnchor="middle" fill={"blue"}>
        {payload.name}
      </text> */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        cornerRadius={5}
        opacity={0.8}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};
