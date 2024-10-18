"use client";
import React, { useState } from "react";
import BlobTxnsChart from "./BlobTxnsChart";
import BlobSizeChart from "./BlobSizeChart";
import BlobHashesChart from "./BlobHashesChart";
import BlobEthFeeChart from "./BlobEthFeeChart";

type Props = {};

function BlobsStats({}: Props) {
  const [duration, setDuration] = useState(15);
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between">
        <p>Blob Stats</p>
        <div className="flex gap-2">
          <button className="btn  btn-sm" onClick={() => setDuration(7)}>
            7d
          </button>
          <button className="btn  btn-sm" onClick={() => setDuration(30)}>
            30d
          </button>

          <button className="btn  btn-sm" onClick={() => setDuration(90)}>
            90d
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 lg:h-[20em] ">
        <div className="border-base-200 border-r p-5">
          <BlobSizeChart duration={duration} />
        </div>
        <div className=" p-5">
          <BlobTxnsChart duration={duration} />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 lg:h-[20em] ">
        <div className="border-base-200 border-r p-5">
          <BlobHashesChart duration={duration} />
        </div>
        <div className=" p-5">
          <BlobEthFeeChart duration={duration} />
        </div>
      </div>
    </div>
  );
}

export default BlobsStats;
