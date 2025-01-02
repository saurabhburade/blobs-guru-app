import React from "react";
import { useState } from "react";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import axios from "axios";
import DACountDayChart from "./AvailAppDACountDayChart";
import AccountDACountDayChart from "./AvailAppDACountDayChart";
import AccountExtCountDayChart from "./AvailAppExtCountDayChart";
import AccountDASizeDayChart from "./AvailAppDASizeDayChart";
import AccountExtFeesDayChart from "./AvailAppExtFeesDayChart";
import ImageWithFallback from "@/components/ImageWithFallback";
import AppDACountDayChart from "./AvailAppDACountDayChart";
import AvailAppDASizeDayChart from "./AvailAppDASizeDayChart";
import AvailAppExtCountDayChart from "./AvailAppExtCountDayChart";
import AvailAppExtFeesDayChart from "./AvailAppExtFeesDayChart";
import AvailAppDACountDayChart from "./AvailAppDACountDayChart";

type Props = {
  appId: string;
};

function AvailAppStats({ appId }: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(false);

  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between flex-wrap gap-4">
        <div className="flex items-center justify-center gap-2">
          {
            <>
              <ImageWithFallback
                src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
                width={24}
                height={24}
                alt="avail"
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
              <AvailAppDACountDayChart appId={appId} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AppDACountDayChart appId={appId} duration={duration} />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] border-t border-base-200">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <AvailAppExtCountDayChart appId={appId} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AvailAppExtFeesDayChart appId={appId} duration={duration} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AvailAppStats;
