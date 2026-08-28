"use client";
import React, { useState } from "react";
import BlobTxnsChart from "./BlobTxnsChart";
import BlobSizeChart from "./BlobSizeChart";
import BlobHashesChart from "./BlobHashesChart";
import BlobEthFeeChart from "./BlobEthFeeChart";
import BlobOnlyEthFeeChart from "./BlobOnlyEthFeeChart";
import BlobOnlyEthUSDFeeChart from "./BlobOnlyEthUSDFeeChart";
import BlobCostChart from "./BlobCostChart";
import BlobsStatsHourly from "../BlobsStatsHourly/BlobsStats";

type Props = {};

function BlobsStats({}: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(true);
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between">
        <p>Blob Stats</p>
        <div className="flex gap-2">
          <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(true);
            }}
          >
            24Hr
          </button>
          <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(false);
              setDuration(7);
            }}
          >
            7d
          </button>

          <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(false);
              setDuration(30);
            }}
          >
            30d
          </button>

          <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(false);
              setDuration(90);
            }}
          >
            90d
          </button>
        </div>
      </div>
      {showHourly && <BlobsStatsHourly duration={24} />}
      {!showHourly && (
        <>
          <div className="grid lg:grid-cols-2 lg:h-[20em]  border-b border-b-base-200">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <BlobSizeChart duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <BlobTxnsChart duration={duration} />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em]   border-b border-b-base-200">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <BlobHashesChart duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <BlobEthFeeChart duration={duration} />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] ">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <BlobOnlyEthFeeChart duration={duration} />
            </div>
            <div className="border-base-200 border-r p-5 h-[20em]">
              <BlobCostChart duration={duration} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BlobsStats;
