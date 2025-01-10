"use client";
import * as echarts from "echarts";
import {
  Cross,
  Database,
  Info,
  Link,
  NotepadText,
  Shield,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { formatAddress, formatBytes } from "@/lib/utils";
import BigNumber from "bignumber.js";
import {
  getAccountDetailsFromAddressBook,
  getAppDetailsFromAppBook,
} from "@/configs/constants";
import { useQuery } from "@apollo/client";
import { ACCOUNT_DAY_DATAS_QUERY } from "@/lib/apollo/queries";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import axios from "axios";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useL2BeatSeries } from "@/hooks/useL2BeatSeries";

import { Tooltip as RTooltip } from "react-tooltip";
import L2BeatTvlStats from "./L2BeatTvlStats";
type Props = {};

function L2BeatCard({ account }: any) {
  const accountDetails = getAppDetailsFromAppBook(account);

  const { data: l2BeatAccountDetails, isLoading } = useQueryFetch({
    queryKey: ["l2BeatAccountDetails", account],
    queryFn: async () => {
      const d = await axios.get(accountDetails?.l2beatProjectDataUrl);
      return d?.data;
    },
  });

  //   const { data: l2BeatSeries, error } = useL2BeatSeries({
  //     duration: "30d",
  //     projectId: l2BeatAccountDetails?.id,
  //   });
  //   const [tvlData, activityData, txnData] = useMemo(() => {
  //     if (!l2BeatSeries) {
  //       return [];
  //     }
  //     const resultRaw = l2BeatSeries?.map(({ result }) => {
  //       const currentDayData = result?.pop()?.map((v, idx) => {
  //         return {
  //           date: new Date(v[0] * 1000),
  //           [`value-${idx}`]: v,
  //         };
  //       });
  //       const prevDayData = result[result?.length - 2]?.map((v, idx) => {
  //         return {
  //           date: new Date(v[0] * 1000),
  //           [`value-${idx}`]: v,
  //         };
  //       });
  //       return {
  //         currentDayData,
  //         currentDayData,
  //       };
  //     });
  //     return resultRaw;
  //   }, [l2BeatSeries]);

  const pieChartData = useMemo(() => {
    const riskView = l2BeatAccountDetails?.riskView;

    const dataAvailability = {
      name: "Data Availability",
      valuePie: 1,
      ...riskView?.dataAvailability,
    };
    const exitWindow = {
      name: "Exit Window",
      valuePie: 1,
      ...riskView?.exitWindow,
    };
    const sequencerFailure = {
      name: "Sequencer Failure",
      valuePie: 1,
      ...riskView?.sequencerFailure,
    };
    const proposerFailure = {
      name: "Proposer Failure",
      valuePie: 1,
      ...riskView?.proposerFailure,
    };
    const stateValidation = {
      name: "State Validation",
      valuePie: 1,
      ...riskView?.stateValidation,
    };
    return [
      dataAvailability,
      exitWindow,
      sequencerFailure,
      proposerFailure,
      stateValidation,
    ];
  }, [l2BeatAccountDetails]);
  if (!l2BeatAccountDetails && !isLoading) {
    return null;
  }
  if (isLoading) {
    return null;
  }
  return (
    <div className="bg-base-100/50 border-base-300/30 border rounded-lg  ">
      <div className="flex gap-2 flex-wrap items-center border-b border-base-200 justify-between p-4">
        <div className="flex gap-2 items-center  ">
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

              <div>
                <p className="text-xl">{l2BeatAccountDetails?.display?.name}</p>
                {/* <p className="text-xs">Source L2BEAT</p> */}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {l2BeatAccountDetails?.badges?.map((b: string) => {
            return (
              <img
                key={`l2BeatAccountDetails__${b}`}
                src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/images/badges/${b}.png?raw=true`}
                alt=""
                className="lg:w-[50px] w-[30px] lg:h-[50px] h-[30px]"
              />
            );
          })}
        </div>
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
          <div className="border-r border-x-base-200/50 bg-base-100  h-full pb-4">
            <div className="flex justify-between items-center p-4 pb-0">
              <p>{l2BeatAccountDetails?.display?.description}</p>
            </div>
            <div className=" grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-4 ">
                <div className="flex items-center gap-2">
                  <p className=""> Stage</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold break-words overflow-hidden">
                    {" "}
                    {l2BeatAccountDetails?.stage?.stage}
                  </p>
                  {getStageName(l2BeatAccountDetails?.stage?.stage) && (
                    <a id="clickable">
                      {" "}
                      <Info width={24} height={24} className="text-primary" />
                    </a>
                  )}
                  <RTooltip
                    anchorSelect="#clickable"
                    clickable
                    className="!p-0 m-0 !bg-base-100 overflow-hidden  !rounded-lg !text-current !opacity-100"
                  >
                    <div className="w-[20em] border border-base-200 !bg-base-100 space-y-2 !rounded-lg !text-current !opacity-100">
                      <div className="p-4 pb-0 ">
                        <p>
                          {" "}
                          {l2BeatAccountDetails?.stage?.stage} ---{" "}
                          {getStageName(l2BeatAccountDetails?.stage?.stage)}
                        </p>
                      </div>
                      <hr className=" border-base-200" />
                      <div className="p-4 pt-0 space-y-2">
                        <p className="">
                          Items missing for{" "}
                          {l2BeatAccountDetails?.stage?.missing?.nextStage}
                        </p>
                        <div className="space-y-1">
                          {l2BeatAccountDetails?.stage?.missing?.requirements?.map(
                            (r: string) => {
                              return (
                                <div
                                  className="flex items-center gap-4"
                                  key={r}
                                >
                                  <div>
                                    <X
                                      width={24}
                                      height={24}
                                      className="text-warning"
                                    />
                                  </div>
                                  <p className="text-xs">{r}</p>
                                </div>
                              );
                            }
                          )}
                          <div className="flex items-center gap-4 bg-base-200/50 p-4 rounded-lg">
                            <div>
                              <Info
                                width={24}
                                height={24}
                                className="text-primary"
                              />
                            </div>
                            <p className="text-xs">
                              Please mind, stages do not reflect rollup security
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RTooltip>
                </div>
              </div>
              <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-4 ">
                <div className="flex items-center gap-2">
                  <p className="">Type</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">
                    {" "}
                    {l2BeatAccountDetails?.display?.category}
                  </p>
                </div>
              </div>
              <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-4 ">
                <div className="flex items-center gap-2">
                  <p className="">Purpose</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">
                    {" "}
                    {l2BeatAccountDetails?.display?.purposes[0]}
                  </p>
                </div>
              </div>
              <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-4 ">
                <div className="flex items-center gap-2">
                  <p className="">Provider</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">
                    {" "}
                    {l2BeatAccountDetails?.display?.provider}
                  </p>
                </div>
              </div>
            </div>

            {l2BeatAccountDetails?.milestones &&
              l2BeatAccountDetails?.milestones[0]?.name && (
                <div className=" p-4 bg-base-200/30 mx-4  rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <Shield width={30} height={30} />
                      </div>
                      <p className="font-medium">
                        {l2BeatAccountDetails?.milestones[0]?.name}
                      </p>
                    </div>
                    <p className="text-sm">
                      {new Date(
                        l2BeatAccountDetails?.milestones[0]?.date
                      )?.toLocaleDateString()}
                    </p>
                  </div>
                  <hr className="border-base-200" />

                  <div className=" h-fit rounded-xl gap-4 flex justify-between space-y-4 ">
                    <div className="flex gap-4 items-center">
                      <div className="">
                        <p className="text-xs">
                          {l2BeatAccountDetails?.milestones[0]?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
        {!isLoading && (
          <div className="w-full lg:min-h-[20em] h-full flex items-center justify-center bg-red-50 hidden lg:block">
            <AccountChart account={account} dataPoints={pieChartData} />
          </div>
        )}
        {!isLoading && (
          <div className="flex flex-col justify-between gap-2 p-4 block lg:hidden">
            {pieChartData?.map((d) => {
              const fills = {
                good: "#4CAF50",
                bad: "#F44336",
                warning: "#FF9800",
                neutral: "gray",
              };
              return (
                <div
                  className="collapse collapse-arrow bg-base-100 h-fit"
                  key={`L2beatcard_pieChartData_${d?.name}`}
                >
                  <input type="radio" name="my-accordion-2" />
                  <div className="collapse-title text-md font-medium">
                    <div className=" flex  gap-2 justify-between items-center ">
                      <p className="h-full  ">
                        {`${d?.name} `} ---- {`${d?.value} `}
                      </p>
                      <div
                        className={` w-fit h-full flex items-center  justify-end gap-2 items-end px-4 text-[10px]`}
                      >
                        <span
                          className={` w-[1.5em] h-[1.5em]  rounded-full flex items-center justify-center `}
                          // bg-[${payload[0]?.payload?.fill}]
                          style={{
                            // @ts-ignore
                            boxShadow: `0px 0px 12px ${fills[d?.sentiment]}`,
                          }}
                        >
                          <span
                            className={` w-[1em] h-[1em] rounded-full  duration-1000`}
                            // bg-[${payload[0]?.payload?.fill}]
                            style={{
                              // @ts-ignore
                              backgroundColor: fills[d?.sentiment],
                            }}
                          ></span>
                        </span>
                        <p className="capitalize">{d?.sentiment}</p>
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content">
                    <p className="text-sm">{d?.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {l2BeatAccountDetails && (
        <L2BeatTvlStats projectId={l2BeatAccountDetails?.id} />
      )}
    </div>
  );
}

export default L2BeatCard;

function getStageName(stage: string) {
  switch (stage) {
    case "UnderReview":
      return "Stage under review";
    case "Stage 0":
      return "Full training wheels";
    case "Stage 1":
      return "Limited training wheels";
    case "Stage 2":
      return "No training wheels";
    default:
      return undefined;
  }
}

function getColorClassName(stage: string) {
  switch (stage) {
    case "Stage 1":
      return "text-yellow-200";
    case "Stage 2":
      return "text-green-400";
    default:
      return undefined;
  }
}
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const renderCustomizedLabel2 = (props: any) => {
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
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={3}
        className="stroke-base-100 stroke-[10px] "
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        cornerRadius={3}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={6}
        textAnchor={textAnchor}
        fill="#999"
      >
        {payload.name}
      </text>
    </g>
  );
};
const renderCustomizedLabel3 = (props: any) => {
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
    active,
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
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />

      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={6}
        textAnchor={textAnchor}
        fill="#999"
      >
        {payload.name}
      </text>
    </g>
  );
};
const CustomTooltip = ({ active, payload, label, rotation }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={` bg-base-100 border border-base-200 w-[25em] py-4 space-y-4 rounded-lg h-fit overflow-hidden text-xs`}
      >
        <div className="px-4 flex  gap-2 justify-between ">
          <p className="h-full  ">
            {`${payload[0]?.payload?.name} `} ----{" "}
            {`${payload[0]?.payload?.value} `}
          </p>
          <div
            className={` w-fit h-full flex  justify-end gap-2 items-end px-4 text-[10px]`}
          >
            <span
              className={` w-[1.5em] h-[1.5em]  rounded-full flex items-center justify-center `}
              // bg-[${payload[0]?.payload?.fill}]
              style={{
                boxShadow: `0px 0px 12px ${payload[0]?.payload?.fill}`,
              }}
            >
              <span
                className={` w-[1em] h-[1em] rounded-full  duration-1000`}
                // bg-[${payload[0]?.payload?.fill}]
                style={{
                  backgroundColor: payload[0]?.payload?.fill,
                }}
              ></span>
            </span>
            <p className="capitalize">{payload[0]?.payload?.sentiment}</p>
          </div>
        </div>
        <hr className="border-base-200" />
        <div className="px-4">
          <p className="h-full  ">{`${payload[0]?.payload?.description} `}</p>
        </div>
      </div>
    );
  }

  return null;
};
const AccountChart = ({
  account,
  dataPoints,
}: {
  account: string;
  dataPoints: any;
}) => {
  useEffect(() => {}, []);
  return (
    <ResponsiveContainer width="100%" height="100%" className={"bg-base-100"}>
      <PieChart width={400} height={400}>
        <Pie
          dataKey="valuePie"
          isAnimationActive={false}
          data={dataPoints}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={0}
          //   label
          label={renderCustomizedLabel3}
          activeShape={renderCustomizedLabel2}
          labelLine={false}
          cornerRadius={"100%"}
        >
          {dataPoints.map((entry: any, index: number) => {
            const fills = {
              good: "#4CAF50",
              bad: "#F44336",
              warning: "#FF9800",
              neutral: "gray",
            };
            return (
              <Cell
                key={`cell-${index}`}
                // @ts-ignore
                fill={fills[entry?.sentiment] || COLORS[index % COLORS.length]}
                className="stroke-base-100 stroke-[10px] "
                strokeLinejoin="round"
                rx={1000}
              />
            );
          })}
        </Pie>
        {/* @ts-ignore */}
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};
