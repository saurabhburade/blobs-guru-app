import React, { useState } from "react";
import AvailDASizeDayChart from "./AvailDayData/AvailDASizeDayChart";
import AvailDACountDayChart from "./AvailDayData/AvailDACountDayChart";
import AvailExtCountDayChart from "./AvailDayData/AvailExtCountDayChart";
import AvailDAFeesDayChart from "./AvailDayData/AvailDAFeesDayChart";

type Props = {};

function AvailStatsWithDuration({}: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(false);
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between">
        <p>Avail Stats</p>
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
              <AvailDASizeDayChart duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AvailDACountDayChart duration={duration} />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] ">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <AvailDAFeesDayChart duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <AvailExtCountDayChart duration={duration} />
            </div>
          </div>
        </>
      {/* )} */}
    </div>
  );
}

export default AvailStatsWithDuration;
