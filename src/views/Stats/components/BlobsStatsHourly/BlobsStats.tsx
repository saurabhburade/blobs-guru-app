"use client";
import React, { useState } from "react";
import BlobTxnsChart from "./BlobTxnsChart";
import BlobSizeChart from "./BlobSizeChart";
import BlobHashesChart from "./BlobHashesChart";
import BlobEthFeeChart from "./BlobEthFeeChart";
import BlobOnlyEthFeeChart from "./BlobOnlyEthFeeChart";
import BlobOnlyEthUSDFeeChart from "./BlobOnlyEthUSDFeeChart";
import BlobCostChart from "./BlobCostChart";

type Props = {};

function BlobsStatsHourly({ duration }: { duration: number }) {
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="grid lg:grid-cols-2 lg:h-[20em] h-full ">
        <div className="border-base-200 border-r p-5 h-[20em]">
          <BlobSizeChart duration={duration} />
        </div>
        <div className=" p-5 h-[20em]">
          <BlobTxnsChart duration={duration} />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 lg:h-[20em] ">
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
    </div>
  );
}

export default BlobsStatsHourly;
