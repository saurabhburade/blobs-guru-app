import Header from "@/components/Header/Header";
import React from "react";
import PoweredBy from "../Home/components/PoweredBy";
import StatsOverview from "./components/StatsOverview";
import BlobsStats from "./components/BlobsStats/BlobsStats";
import TopAccountsStats from "./components/AccountStats/TopAccountsStats";
import AccountsBySizePie from "./components/AccountStats/Pies/AccountsBySizePie";
import AccountPies from "./components/AccountStats/Pies/AccountPies";

type Props = {};

function StatsDataView({}: Props) {
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
