import * as echarts from "echarts";
import { Database, NotepadText, User } from "lucide-react";
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useQuery } from "@apollo/client";
import { ACCOUNT_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import Link from "next/link";

type Props = {};

function AccountStatCard({ acc, isLoading }: any) {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalBlobGas));
  }, [acc?.totalBlobGas]);
  const totalBlobGasEth = useMemo(() => {
    return new BigNumber(acc?.totalBlobGasEth).div(1e18).toFormat(4);
  }, [acc?.totalBlobGasEth]);
  const totalFeeEth = useMemo(() => {
    return new BigNumber(acc?.totalFeeEth).div(1e18).toFormat(4);
  }, [acc?.totalFeeEth]);
  return (
    <div className="bg-base-100/80 border-base-300/30 border rounded-lg ">
      <div className="flex gap-2 items-center border-b border-base-200/50  p-4">
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
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <NotepadText />
                <p className=""> Blobs Transactions</p>
              </div>
              <p className="text-xl font-bold">
                {" "}
                {new BigNumber(acc?.totalBlobTransactionCount)?.toFormat()}
              </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <Database />

                <p className=""> Blob size</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobSize} </p>
            </div>
            <div className="flex justify-between items-center p-4">
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
          </div>
        )}
        <AccountChart account={acc?.id} />
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
  console.log(`🚀 ~ file: AccountStatCard.tsx:102 ~ data:`, data);
  const memoOptions = useMemo(() => {
    //     totalBlobTransactionCount
    //   dayStartTimestamp;
    //   totalBlobTransactionCount;
    //   totalBlobGas;
    //   totalGasEth;
    //   totalBlobHashesCount;
    //   totalBlobBlocks;
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const datas = data?.accountDayDatas?.map((rawData: any) => {
      const day = formatter.format(
        new Date(Number(rawData?.dayStartTimestamp) * 1000)
      );

      return {
        ...rawData,

        sizeValue: rawData?.totalBlobGas,
        size: formatBytes(Number(rawData?.totalBlobGas)),
        formattedAddress: formatAddress(rawData?.account?.id),
        totalBlobTransactionCount:
          rawData?.totalBlobTransactionCount?.toString(),
        totalGasEth: new BigNumber(rawData?.totalGasEth).div(1e18).toFormat(4),
        timestamp: day,
      };
    });
    return {
      tooltip: {
        trigger: "axis",

        formatter: ([params]: any) => {
          return `
                Blob size :: ${formatBytes(params?.value)}
                 <br/>
                                 ${params?.axisValue}

                `;
        },
      },

      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: datas?.map((d: any) => d.timestamp),
          show: false,
        },
      ],
      yAxis: [
        {
          type: "value",
          visible: false,
          show: false,
        },
      ],
      series: [
        {
          name: "Blob Size",
          type: "line",
          stack: "Total",
          label: {
            show: true,
            position: "top",
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(128, 255, 165,0.4)",
              },
              {
                offset: 1,
                color: "transparent",
              },
            ]),
          },
          tooltip: {
            formatter: function (param: any) {
              param = param[0];
              return [
                "Date: " + param.name + '<hr size=1 style="margin: 3px 0">',
                "Open: " + param.data[0] + "<br/>",
                "Close: " + param.data[1] + "<br/>",
                "Lowest: " + param.data[2] + "<br/>",
                "Highest: " + param.data[3] + "<br/>",
              ].join("");
            },
          },
          emphasis: {
            focus: "series",
          },
          data: datas?.map((d: any) => d.totalBlobGas),
        },
      ],
    };
  }, [data?.accountDayDatas]);

  return (
    <ReactECharts
      option={memoOptions}
      style={{ height: "100%", width: "100%" }}
    />
  );
};
