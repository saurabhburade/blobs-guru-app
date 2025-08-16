"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import React from "react";
import PoweredBy from "../../Home/components/PoweredBy";
import Footer from "@/components/Footer/Footer";

import SearchAccount from "../components/SearchAccount";
import { Globe } from "lucide-react";
import { BsTelegram } from "react-icons/bs";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";

import ChainApps from "./ChainApps";

type Props = {};

function AppsSummary({}: Props) {
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
              src={`https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/frontend/public/icons/ethereum.png?raw=true`}
              fallback="/images/ethereum_logo.png"
              className="rounded-lg"
              width={24}
              height={24}
              alt=""
            />
            <p className="font-bold text-2xl">Ethereum Blobs</p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <SearchAccount />
          </div>
        </div>

        <div className="w-full space-y-4">
          <ChainApps />
          <PoweredBy />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AppsSummary;
