"use client";
import Header from "@/components/Header/Header";
import ImageWithFallback from "@/components/ImageWithFallback";
import React from "react";
import SearchAccount from "../components/SearchAccount";
import PoweredBy from "@/views/Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import DAUtilisation from "../components/DAUtilisation";
import StatsWithDuration from "./StatsWithDuration";

type Props = {};

function StatsView({}: Props) {
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
          <div className="flex gap-2 items-center">
            <ImageWithFallback
              src={`https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/celestia.png?raw=true`}
              fallback="/images/celestia_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Celestia Stats</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>

        <DAUtilisation />
        <StatsWithDuration />
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default StatsView;
