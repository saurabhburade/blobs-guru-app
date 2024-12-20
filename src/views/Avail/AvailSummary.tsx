"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import React from "react";
import PoweredBy from "../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";
import AvailStats from "./components/AvailStats";
import AvailAccounts from "./components/AvailAccounts";

type Props = {};

function AvailSummary({}: Props) {
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
          <img src="/images/avail_logo.png" alt="" className="w-[140px]" />
        </div>
        <div className="w-full space-y-4">
          <AvailStats />
          <AvailAccounts />
          {/* <PoweredBy /> */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AvailSummary;
