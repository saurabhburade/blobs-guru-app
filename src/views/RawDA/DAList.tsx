"use client";
import Header from "@/components/Header/Header";
import { COLLECTIVE_STAT_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import React from "react";

import Sidebar from "@/components/Sidebar/Sidebar";
import AccountsBySizePie from "../Stats/components/AccountStats/Pies/AccountsBySizePie";
import AccountsByBlobsPie from "../Stats/components/AccountStats/Pies/AccountsByBlobsPie";

import { AccountRows } from "../Accounts/AccountsView";
import AccountsByFeePie from "../Stats/components/AccountStats/Pies/AccountsByFeePie";
import AccountsByFeePieUSD from "../Stats/components/AccountStats/Pies/AccountsByFeePieUSD";
import BlobCostChart from "../Stats/components/BlobsStats/BlobCostChart";

import BlobOnlyEthUSDFeeChart from "../Stats/components/BlobsStats/BlobOnlyEthUSDFeeChart";
import BlobOnlyEthFeeChart from "../Stats/components/BlobsStats/BlobOnlyEthFeeChart";
import { useDAProvidersRaw } from "@/hooks/useDAProviders";

type Props = {};
const fills = {
  good: "#4CAF50",
  bad: "#F44336",
  warning: "#FF9800",
  neutral: "gray",
};
function DAList({}: Props) {
  const daList = useDAProvidersRaw();

  return (
    <div className="grid lg:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="lg:block hidden">
        <Sidebar />
      </div>
      <div className="lg:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">
            Data Availability Providers
          </h2>
        </div>

        <div className="border border-base-200 rounded-lg">
          <div className="hidden xl:grid xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] py-4 border-b border-base-200 text-sm items-center">
            <div className="flex items-center px-4">DA Layer</div>
            <p>Economic Security</p>
            <p>Fraud detection</p>
            <p>Bridge</p>
            <p>Committee security</p>
            <p>Upgradeability</p>
            <p>Relayer failure</p>
          </div>
          {/* <div className="grid grid-cols-7 items-center w-full text-sm border-b border-base-200">
            <div className="flex gap-2 p-2 h-fit">
              <img
                src="/images/eigen-da.png"
                alt=""
                className="rounded-lg size-10"
              />
              <div>
                <p>EIP 4844</p>
                <p>Public Chain</p>
              </div>
            </div>
            <div>Staked Assets</div>
            <div>DAS</div>
            <div className="col-span-4 w-full ">
              <div className="grid grid-cols-4 p-2 bg-base-200/40 border-b border-base-200">
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
              </div>
              <div className="grid grid-cols-4 p-2 bg-base-200/40 border-b border-base-200">
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
              </div>
              <div className="grid grid-cols-4 p-2 bg-base-200/40 border-b border-base-200">
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
                <p>No Bridge</p>
              </div>
            </div>
          </div> */}
          {daList?.map((provider) => {
            return (
              <div
                className="grid w-full grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]  items-center w-full  border-b border-base-200 self-center font-semibold"
                key={provider?.data?.id}
              >
                <div className="flex gap-4 p-4 h-fit w-full lg:col-span-1 col-span-2 lg:border-b-0 border-b border-base-200">
                  <img
                    src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/${provider?.data?.display?.slug}.png?raw=true`}
                    // src="/images/eigen-da.png"
                    alt=""
                    className="rounded-lg size-10 bg-white p-1"
                  />
                  <div className=" justify-between items-center gap-2 w-full ">
                    <p className="font-bold ">
                      {provider?.data?.display?.name}
                    </p>
                    <p className="opacity-50 text-sm font-normal">
                      {provider?.data?.kind}
                    </p>
                  </div>
                </div>
                <div className="py-4 px-2">
                  <p className="text-xs opacity-50 lg:hidden font-normal">
                    Eco. Security
                  </p>
                  <p
                    style={{
                      color:
                        // @ts-ignore
                        fills[
                          provider?.data?.risks?.economicSecurity?.sentiment
                        ],
                    }}
                  >
                    {provider?.data?.risks?.economicSecurity?.value}
                  </p>
                </div>
                <div className="py-4 px-2">
                  <p className="text-xs opacity-50 lg:hidden font-normal">
                    Fraud Detection
                  </p>
                  <p
                    style={{
                      color:
                        // @ts-ignore
                        fills[provider?.data?.risks?.fraudDetection?.sentiment],
                    }}
                  >
                    {provider?.data?.risks?.fraudDetection?.value}
                  </p>
                </div>
                {/* <div className="py-4">
                  <p>{provider?.data?.risks?.fraudDetection?.value}</p>
                </div> */}

                <div className="col-span-2 lg:col-span-4 w-full ">
                  {provider?.data?.bridges?.map((bridge: any) => {
                    return (
                      <div
                        className="grid grid-cols-2 lg:grid-cols-4 p-2 bg-base-200/40 border-b border-base-200 min-h-[5em] w-full overflow-scroll"
                        key={bridge?.id}
                      >
                        <div className="py-4 px-2">
                          <p className="text-xs opacity-50 lg:hidden font-normal">
                            Bridge
                          </p>
                          <p className="self-center">{bridge?.display?.name}</p>
                        </div>
                        <div className="py-4 px-2">
                          <p className="text-xs opacity-50 lg:hidden font-normal">
                            Committee Security
                          </p>
                          <p
                            className="self-center"
                            style={{
                              color:
                                // @ts-ignore
                                fills[
                                  bridge?.risks?.committeeSecurity?.sentiment
                                ],
                            }}
                          >
                            {bridge?.risks?.committeeSecurity?.value}
                          </p>
                        </div>
                        <div className="py-4 px-2">
                          <p className="text-xs opacity-50 lg:hidden font-normal">
                            Upgradeability
                          </p>
                          <p
                            className="self-center"
                            style={{
                              color:
                                // @ts-ignore
                                fills[bridge?.risks?.upgradeability?.sentiment],
                            }}
                          >
                            {bridge?.risks?.upgradeability?.value}
                          </p>
                        </div>
                        <div className="py-4 px-2">
                          <p className="text-xs opacity-50 lg:hidden font-normal">
                            Relay Failure
                          </p>
                          <p
                            className="self-center"
                            style={{
                              color:
                                // @ts-ignore
                                fills[bridge?.risks?.relayerFailure?.sentiment],
                            }}
                          >
                            {bridge?.risks?.relayerFailure?.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DAList;
