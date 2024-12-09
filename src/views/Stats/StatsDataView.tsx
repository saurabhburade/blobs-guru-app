import Header from "@/components/Header/Header";
import React from "react";
import PoweredBy from "../Home/components/PoweredBy";
import StatsOverview from "./components/StatsOverview";
import BlobsStats from "./components/BlobsStats/BlobsStats";
import TopAccountsStats from "./components/AccountStats/TopAccountsStats";
import AccountsBySizePie from "./components/AccountStats/Pies/AccountsBySizePie";
import AccountPies from "./components/AccountStats/Pies/AccountPies";
import Sidebar from "@/components/Sidebar/Sidebar";
import BlobUtilisation from "../Size/components/BlobUtilisation";

type Props = {};

function StatsDataView({}: Props) {
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
          <h2 className="lg:text-xl text-xl font-semibold">Blob Stats</h2>
        </div>
        <BlobUtilisation />
        <StatsOverview />
        {/* <PoweredBy /> */}
        <BlobsStats />
        <div className="bg-base-100 border border-base-200">
          <div className="p-5 border-b border-base-200">Top Rollups</div>
          <TopAccountsStats />
        </div>
        <div className="bg-base-100 border border-base-200">
          <div className="p-5 border-b border-base-200">
            Rollup distribution
          </div>
          <AccountPies />
        </div>
      </div>
    </div>
  );
  return (
    <div className="">
      <Header />
      <div className="mx-auto p-4 lg:p-20 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <StatsOverview />
        {/* <PoweredBy /> */}
        <BlobsStats />
        <div className="bg-base-100 border border-base-200">
          <div className="p-5 border-b border-base-200">Top Rollups</div>
          <TopAccountsStats />
        </div>
        <div className="bg-base-100 border border-base-200">
          <div className="p-5 border-b border-base-200">
            Rollup distribution
          </div>
          <AccountPies />
        </div>
      </div>
    </div>
  );
}

export default StatsDataView;
