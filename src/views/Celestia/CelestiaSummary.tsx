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

type Props = {};

function CelestiaSummary({}: Props) {
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
              src={`https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/celestia.png`}
              fallback="/images/celestia_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Celestia DA</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>
        <div className=" bg-base-200/15 p-5 flex-wrap lg:flex-nowrap rounded-lg text-sm space-y-2 flex gap-5 items-center justify-between ">
          <p className=" lg:w-1/2">
            Celestia is a modular data availability network that allows L2s to
            post arbitrary data as blobs.
          </p>
          <div className="flex  items-center gap-3">
            <Link
              href={"https://celestia.org"}
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
              href={"https://x.com/Celestia"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaXTwitter
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={"https://t.me/CelestiaCommunity"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaTelegramPlane
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={"https://github.com/celestiaorg"}
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
                "https://l2beat.com/data-availability/projects/celestia/no-bridge"
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
              <DASizeDayChartHome duration={30} />
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

export default CelestiaSummary;
