"use client";
import React from "react";
import AvailAccounts from "../components/AvailAccounts";
import Footer from "@/components/Footer/Footer";
import PoweredBy from "@/views/Home/components/PoweredBy";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import ImageWithFallback from "@/components/ImageWithFallback";
import SearchAccount from "../components/SearchAccount";

type Props = {};

function AvailAccountsView({}: Props) {
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
              src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
              fallback="/images/avail_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Avail Accounts</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>
        <AvailAccounts />
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default AvailAccountsView;
