"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import React from "react";
import PoweredBy from "../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";
import AvailStats from "./components/AvailStats";
import AvailAccounts from "./components/AvailAccounts";
import AvailDAUtilisation from "./components/AvailDAUtilisation";
import AvailPriceDayChart from "./components/AccountStats/AvailPriceDayChart";
import SearchAccount from "./components/SearchAccount";
import { Globe } from "lucide-react";
import { BsTelegram } from "react-icons/bs";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import AvailDASizeDayChart from "./components/AvailStats/AvailDASizeDayChart";
import AvailDASizeHourChart from "./components/AvailStats/AvailDASizeHourChart";

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
          {/* <img src="/images/avail_logo.png" alt="" className="w-[140px]" /> */}
          <div className="flex gap-2 items-center">
            <ImageWithFallback
              src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
              fallback="/images/avail_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Avail DA</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>
        <div className=" bg-base-200/15 p-5 flex-wrap lg:flex-nowrap rounded-lg text-sm space-y-2 flex gap-5 items-center justify-between ">
          <p className=" lg:w-1/2">
            Avail is a public blockchain and data availability network combining
            erasure coding, KZG polynomial commitments, and data availability
            sampling.
          </p>
          <div className="flex  items-center gap-3">
            <Link
              href={"https://www.availproject.org/"}
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
              href={"https://x.com/AvailProject"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaXTwitter
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={"https://t.me/AvailCommunity"}
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <FaTelegramPlane
                size={24}
                className=" opacity-70 hover:opacity-90 transition-all cursor-pointer"
              />
            </Link>
            <Link
              href={"https://github.com/availproject/"}
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
                "https://l2beat.com/data-availability/projects/avail/no-bridge"
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
              <AvailDASizeHourChart duration={24} />
            </div>
            <div className=" p-5 h-[20em]  rounded-lg bg-base-200/15">
              <AvailPriceDayChart duration={60} />
            </div>
          </div>
          <AvailStats />
          <AvailAccounts />
          <PoweredBy />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AvailSummary;
