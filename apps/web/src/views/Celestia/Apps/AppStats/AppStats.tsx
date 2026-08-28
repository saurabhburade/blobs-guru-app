import React from "react";
import { useState } from "react";

import ImageWithFallback from "@/components/ImageWithFallback";
import AppDACountDayChart from "./AppDACountDayChart";
import AppDASizeDayChart from "./AppDASizeDayChart";
import AppExtCountDayChart from "./AppExtCountDayChart";
import AppExtFeesDayChart from "./AppExtFeesDayChart";

type Props = {
  appId: string;
};

function AppStats({ appId }: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(false);

  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between flex-wrap gap-4">
        <div className="flex items-center justify-center gap-2">
          {
            <>
              <ImageWithFallback
                src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/celestia.png?raw=true`}
                width={24}
                height={24}
                alt="celestia"
                className="rounded-lg"
              />
              <p>DA Stats</p>
            </>
          }
        </div>
        <div className="flex gap-2">
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

      {!showHourly && (
        <>
          <div className="grid lg:grid-cols-2 lg:h-[20em] ">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <AppDASizeDayChart appId={appId} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AppDACountDayChart appId={appId} duration={duration} />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] border-t border-base-200">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <AppExtCountDayChart appId={appId} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AppExtFeesDayChart appId={appId} duration={duration} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AppStats;
