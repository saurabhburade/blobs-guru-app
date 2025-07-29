"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import React from "react";
import PoweredBy from "../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";

import SearchAccount from "./components/SearchAccount";
import { Globe } from "lucide-react";
import { BsTelegram } from "react-icons/bs";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";

import BlocksList from "./Blocks/BlocksList";

import DASizeDayChartHome from "./components/Stats/DASizeDayChartHome";
import PriceDayChart from "./components/AccountStats/PriceDayChart";
import ChainStats from "./components/ChainStats";
import DASizeDayChart from "./Stats/DayData/DASizeDayChart";

type Props = {};

function EthereumSummary({}: Props) {
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
              src={`https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/ethereum.png`}
              fallback="/images/ethereum_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Ethereum EIP4844</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>
        <div className=" bg-base-200/15 p-5 flex-wrap lg:flex-nowrap rounded-lg text-sm space-y-2 flex gap-5 items-center justify-between ">
          <p className=" lg:w-2/3">
            EIP-4844 allows for blob-carrying transactions containing large
            amounts of data on the consensus layer, and whose commitment can be
            accessed by the EVM on the execution layer.
          </p>
          <div className="flex  items-center gap-3">
            <Link
              href={"https://ethereum.org"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <Globe
                width={24}
                height={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={"https://x.com/ethereum"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaXTwitter
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>

            <Link
              href={"https://github.com/ethereum"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaGithub
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={
                "https://l2beat.com/data-availability/projects/ethereum/ethereum"
              }
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <img
                src="/images/l2beat.png"
                width={34}
                height={34}
                alt=""
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
          </div>
        </div>
        <div className="w-full space-y-4">
          <div className="grid lg:grid-cols-2 lg:h-[20em] gap-4">
            <div className=" p-5 h-[20em] rounded-lg bg-base-200/15">
              <DASizeDayChart duration={30} />
            </div>
            <div className=" p-5 h-[20em]  rounded-lg bg-base-200/15">
              <PriceDayChart duration={60} />
            </div>
          </div>
          <ChainStats />
          <BlocksList />

          <PoweredBy />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default EthereumSummary;
