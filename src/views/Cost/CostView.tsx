"use client";
import Header from "@/components/Header/Header";
import { COLLECTIVE_STAT_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import React from "react";

import Sidebar from "@/components/Sidebar/Sidebar";
import AccountsBySizePie from "../Stats/components/AccountStats/Pies/AccountsBySizePie";
import AccountsByBlobsPie from "../Stats/components/AccountStats/Pies/AccountsByBlobsPie";
import BlobUtilisation from "./components/BlobUtilisation";
import { AccountRows } from "../Accounts/AccountsView";
import AccountsByFeePie from "../Stats/components/AccountStats/Pies/AccountsByFeePie";
import AccountsByFeePieUSD from "../Stats/components/AccountStats/Pies/AccountsByFeePieUSD";
import BlobCostChart from "../Stats/components/BlobsStats/BlobCostChart";

import BlobOnlyEthUSDFeeChart from "../Stats/components/BlobsStats/BlobOnlyEthUSDFeeChart";
import BlobOnlyEthFeeChart from "../Stats/components/BlobsStats/BlobOnlyEthFeeChart";
import PoweredBy from "../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";

type Props = {};

function CostView({}: Props) {
  const { data: collectiveData, loading: statsLoading } = useQuery(
    COLLECTIVE_STAT_QUERY
  );

  return (
    <div className="grid xl:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="xl:block hidden">
        <Sidebar />
      </div>
      <div className="xl:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">Blob Cost</h2>
        </div>
        <div className=" h-fit border border-base-200 rounded-lg p-1">
          <div className="  grid lg:grid-cols-2 ">
            <div className="border-base-200 lg:border-r lg:h-[20em]">
              <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
                <p className="text-xs p-3 border-b border-base-200 ">
                  Blob Fee Distribution
                </p>

                <AccountsByFeePie
                  collectiveData={collectiveData?.collectiveData}
                />
              </div>
            </div>
            <div className="border-base-200 border-t w-full lg:border-t-0 lg:h-[20em] ">
              <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
                <p className="text-xs p-3 border-b border-base-200 ">
                  Blob Fee [USD]
                </p>

                <AccountsByFeePieUSD
                  collectiveData={collectiveData?.collectiveData}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="h-full border border-base-200 rounded-lg p-4">
          <BlobOnlyEthFeeChart duration={30} />
        </div>
        <AccountRows />
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default CostView;
