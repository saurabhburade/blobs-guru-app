import React, { useState } from "react";
import DASizeDayChart from "./DayData/DASizeDayChart";
import TxnCountDayChart from "./DayData/TxnCountDayChart";
import DACountDayChart from "./DayData/DACountDayChart";
import DAFeesDayChart from "./DayData/DAFeesDayChart";

type Props = {};

function StatsWithDuration({}: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(false);
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between">
        <p>EIP 4844 Stats</p>
        <div className="flex gap-2">
          {/* <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(true);
            }}
          >
            24Hr
          </button> */}
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
      {/* {showHourly && <BlobsStatsHourly duration={24} />} */}
      {/* {!showHourly && ( */}
      <>
        <div className="grid lg:grid-cols-2 lg:h-[20em]  ">
          <div className="border-base-200 border-r p-5 h-[20em]">
            <DASizeDayChart duration={duration} />
          </div>
          <div className=" p-5 h-[20em]">
            <DACountDayChart duration={duration} />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 lg:h-[20em] ">
          <div className="border-base-200 border-r p-5 h-[20em]">
            <DAFeesDayChart duration={duration} />
          </div>
          <div className=" p-5 h-[20em]">
            <TxnCountDayChart duration={duration} />
          </div>
        </div>
      </>
      {/* )} */}
    </div>
  );
}

export default StatsWithDuration;
