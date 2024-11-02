import { useEigenDaThroughput } from "@/hooks/useEigenDa";
import React, { useMemo } from "react";
import EigenDAThroughputChart from "./EigenDAThroughputChart";
import {
  Blocks,
  CircleGauge,
  Dices,
  Gauge,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import BigNumber from "bignumber.js";

type Props = {};

function EigenDA({ d, lastHourDataEigen }: { d: any; lastHourDataEigen: any }) {
  return (
    <div className=" border border-base-300/20 bg-base-100/50  ">
      <p className="p-5 border-b border-base-300/20">EigenDA</p>
      <div className=" flex lg:flex-nowrap flex-wrap items-stretch">
        <div className="p-5  w-full  rounded-lg">
          <div className="grid lg:grid-cols-3 gap-2 h-full text-sm">
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <Gauge className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90 ">Current Throughput</p>
              <p className="text-2xl font-bold">
                {lastHourDataEigen?.valueF} MiB{" "}
                <span className="text-sm opacity-60">/sec</span>
              </p>
            </div>
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <Blocks className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90">Expandable blockspace</p>
              <p className="text-2xl font-bold">NA</p>
            </div>
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <CircleGauge className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90">Full Throughput</p>
              <p className="text-2xl font-bold">
                15 MiB <span className="text-sm opacity-60">/sec</span>
              </p>
            </div>
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <ShieldCheck className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90">DA Verification time *</p>
              <p className="text-2xl font-bold">600 sec</p>
            </div>
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <Dices className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90">DA Sampling</p>
              <p className="text-2xl font-bold">NA*</p>
            </div>
            <div className=" p-4 bg-base-200/30 h-full rounded-xl space-y-2 ">
              <PackageCheck className="w-[2em] h-[2em] opacity-90" />
              <p className="opacity-90">Proof Mechanism</p>
              <p className="text-2xl font-bold">Validity Proofs</p>
            </div>
          </div>
          {/* <BlobTransactionDayChart /> */}
          {/* <BlobSizeDayChart /> */}
        </div>
        <div className="p-5 h-[20em]  border-l  border-base-300/20 w-full ">
          <EigenDAThroughputChart d={d} />
        </div>
      </div>
    </div>
  );
}

export default EigenDA;
