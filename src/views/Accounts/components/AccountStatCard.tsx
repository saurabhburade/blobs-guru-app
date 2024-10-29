import * as echarts from "echarts";
import {
  Coins,
  Database,
  DollarSign,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { cn, formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useQuery } from "@apollo/client";
import { ACCOUNT_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {};

function AccountStatCard({ acc, isLoading, className }: any) {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalBlobGas));
  }, [acc?.totalBlobGas]);
  const totalBlobGasEth = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasEth).div(1e18).toFormat(4);
  }, [acc?.totalBlobGasEth]);
  const totalBlobGasUSD = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasUSD).div(1e18).toFormat(2);
  }, [acc?.totalBlobGasUSD]);
  const costPerKb = useMemo(() => {
    return new BigNumber(Number(acc?.totalBlobGasUSD))
      .div(Number(acc?.totalBlobGas))
      .div(1e18)
      .multipliedBy(1024)
      .toFormat(6);
  }, [acc?.totalFeeEth]);
  return (
    <div
      className={cn(
        "bg-base-100/80 border-base-300/30 border rounded-lg ",
        className ? className : ""
      )}
    >
      <div className="flex gap-2 items-center border-b border-base-200/50  h-[4em] p-4">
        {isLoading && (
          <>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
          </>
        )}
        {!isLoading && (
          <>
            <img
              src={accountDetails?.logoUri || "/images/logox.jpeg"}
              className="rounded-lg"
              width={40}
              height={40}
              alt=""
            />

            <Link href={`/accounts/${acc?.id}`}>
              {accountDetails?.name ? (
                <p className=""> {accountDetails?.name}</p>
              ) : (
                <p className=""> {acc?.id}</p>
              )}
            </Link>
          </>
        )}
      </div>
      <div className=" grid lg:grid-cols-2">
        {isLoading && (
          <div className="border-r border-x-base-200/50">
            {new Array(4).fill(1)?.map((num, idx) => {
              return (
                <div
                  className="flex justify-between items-center p-4 py-4"
                  key={`AccountStatCard_${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[2em] h-[2em] animate-pulse"></div>

                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
                  </div>

                  <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[2em] lg:w-[5em] lg:w-[10em] h-[22px] animate-pulse"></div>
                </div>
              );
            })}
          </div>
        )}
        {!isLoading && (
          <div className="border-r border-x-base-200/50">
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logox.jpeg"
                  className="rounded-lg"
                  width={20}
                  height={20}
                  alt=""
                />
                <p className=""> Total Blobs</p>
              </div>
              <p className="text-xl font-bold">
                {" "}
                {new BigNumber(acc?.totalBlobHashesCount)?.toFormat()}
              </p>
            </div>
            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <NotepadText />
                <p className=""> Blobs Transactions</p>
              </div>
              <p className="text-xl font-bold">
                {" "}
                {new BigNumber(acc?.totalBlobTransactionCount)?.toFormat()}
              </p>
            </div>
            <div className="flex justify-between items-center py-3 p-4">
              <div className="flex items-center gap-2">
                <Database />

                <p className=""> Blob size</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobSize} </p>
            </div>
            <div className="flex justify-between items-center py-3 p-4">
              <div className="flex items-center gap-2">
                <img
                  src="/images/icons/eth.svg"
                  className="rounded-lg"
                  width={20}
                  height={20}
                  alt=""
                />
                <p className=""> Blobs fee</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobGasEth} ETH</p>
            </div>
            <div className="flex justify-between items-center  p-4">
              <div className="flex items-center gap-2">
                <DollarSign />
                <p className=""> Blobs fee</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobGasUSD} USD</p>
            </div>
            <div className="flex justify-between items-center  p-4">
              <div className="flex items-center gap-2">
                <DollarSign />
                <p className=""> Fee per KiB</p>
              </div>
              <p className="text-xl font-bold"> {costPerKb} USD</p>
            </div>
          </div>
        )}
        <div className="p-5  bg-base-100/50    border-base-300/20 w-full ">
          <AccountChart account={acc?.id} />
        </div>
      </div>
    </div>
  );
}

export default AccountStatCard;

const AccountChart = ({ account }: { account: string }) => {
  const { data } = useQuery(ACCOUNT_DAY_DATAS_QUERY, {
    variables: {
      address: account,
    },
  });
  const chartData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.accountDayDatas?.map((rawData: any) => {
      const day = formatter.format(
        new Date(Number(rawData?.dayStartTimestamp) * 1000)
      );

      return {
        ...rawData,

        sizeValue: Number(rawData?.totalBlobGas),
        size: formatBytes(Number(rawData?.totalBlobGas)),
        formattedAddress: formatAddress(rawData?.account?.id),
        totalBlobTransactionCount:
          rawData?.totalBlobTransactionCount?.toString(),
        totalGasEth: new BigNumber(rawData?.totalGasEth).div(1e18).toFormat(4),
        timestamp: day,
        timestamp2: new Date(
          Number(rawData?.dayStartTimestamp) * 1000
        ).toDateString(),
      };
    });
    return datas?.reverse();
  }, [data?.accountDayDatas]);

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <AreaChart
        // width={730}
        // width={100}
        // height={100}
        data={chartData}
        // margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUvAccStatCard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* <XAxis dataKey="timestamp2" className="text-xs" axisLine={false} /> */}
        <Legend
          verticalAlign="top"
          content={() => (
            <span className="text-xs">Last 15 days Blob size</span>
          )}
        />
        <Tooltip content={CustomTooltipRaw} />
        <Area
          type="monotone"
          dataKey="sizeValue"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUvAccStatCard)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CustomTooltipRaw = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-200 w-[15em] rounded-lg   overflow-hidden text-xs`}
      >
        <div className="p-4 ">
          <p className=" ">Size: {`${payload[0]?.payload?.size}`}</p>
          <p className="  ">
            Timestamp: {`${payload[0]?.payload?.timestamp2}`}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
