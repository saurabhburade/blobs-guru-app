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
import React, { PureComponent, useEffect, useMemo } from "react";
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
  const { data } = useQuery(TOP_BLOB_ACCOUNTS_QUERY);

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

    return datas;
  }, [data?.accounts, collectiveData]);
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <div className="grid lg:grid-cols-[1fr_2fr] w-full h-full ">
        <div className="w-[20em] h-[20em] overflow-hidden">
          <div className="w-[19.5em]   flex flex-col items-center justify-center h-[18.5em]   absolute   rounded-full">
            <p className="font-semibold">
              {" "}
              {new BigNumber(
                Number(collectiveData?.totalBlobTransactionCount)
              )?.toFormat()}
            </p>
          </div>
          <PieChart width={400} height={400} className=" p-0">
            <Pie
              cx={150}
              cy={120}
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={0}
              dataKey="totalBlobTransactionCount"
              cornerRadius={5}
              stroke="0"
            >
              {chartData?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="top"
              content={() => <span className="text-xs px-4">Blob tx</span>}
            />
            <Tooltip content={CustomTooltipRaw} />
          </PieChart>
        </div>
        <div className="space-y-1 flex flex-col justify-center px-4">
          {chartData?.map((entry, index) => (
            <div
              key={`account-row-${entry?.id}`}
              className="p-2 hover:bg-base-200/50 rounded-lg flex justify-between  items-center"
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
