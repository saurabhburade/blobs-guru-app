import React from "react";
import { useState } from "react";
import DayBlobSizeAccountChart from "../DayBlobSizeAccountChart";
import DayHashesBlobAccountChart from "../DayHashesBlobAccountChart";
import DayBlobFeeAccountChart from "../DayBlobFeeAccountChart";
import DayTxnsBlobAccountChart from "../DayTxnsBlobAccountChart";
import HourBlobFeeAccountChart from "../HourBlobFeeAccountChart";
import HourBlobSizeAccountChart from "../HourBlobSizeAccountChart";
import HourHashesBlobAccountChart from "../HourHashesBlobAccountChart";
import HourTxnsBlobAccountChart from "../HourTxnsBlobAccountChart";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import axios from "axios";

type Props = {
  account: string;
};

function AccountDayStats({ account }: Props) {
  const [duration, setDuration] = useState(15);
  const [showHourly, setShowHourly] = useState(false);

  const accountDetails = getAccountDetailsFromAddressBook(account);

  const { data: l2BeatAccountDetails, isLoading } = useQueryFetch({
    queryKey: ["l2BeatAccountDetails", account],
    queryFn: async () => {
      const d = await axios.get(accountDetails?.l2beatProjectDataUrl);
      return d?.data;
    },
  });
  return (
    <div className="bg-base-100 border border-base-200">
      <div className="p-5 border-b border-base-200 flex justify-between flex-wrap gap-4">
        <div className="flex items-center justify-center gap-2">
          {isLoading && (
            <>
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>
              <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
            </>
          )}
          {!isLoading && (
            <>
              <img
                src={accountDetails?.logoUri || "/images/logox.jpeg"}
                className="rounded-lg"
                width={40}
                height={40}
                alt=""
              />

              <p>Blobs Stats</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="btn  btn-sm"
            onClick={() => {
              setShowHourly(true);
              setDuration(24);
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

      {!showHourly && (
        <>
          <div className="grid lg:grid-cols-2 lg:h-[20em] h-full ">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <DayBlobSizeAccountChart account={account} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <DayHashesBlobAccountChart
                account={account}
                duration={duration}
              />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] border-t border-base-200">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <DayBlobFeeAccountChart account={account} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <DayTxnsBlobAccountChart account={account} duration={duration} />
            </div>
          </div>
          {/* <div className="grid lg:grid-cols-2 lg:h-[20em] ">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <DayBlobSizeAccountChart account={account} duration={duration} />
            </div>
            <div className="border-base-200 border-r p-5 h-[20em]">
              <DayBlobSizeAccountChart account={account} duration={duration} />
            </div>
          </div> */}
        </>
      )}
      {showHourly && (
        <>
          <div className="grid lg:grid-cols-2 lg:h-[20em] h-full ">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <HourBlobSizeAccountChart account={account} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <HourHashesBlobAccountChart
                account={account}
                duration={duration}
              />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 lg:h-[20em] border-t border-base-200">
            <div className="border-base-200 lg:border-b-0 border-b lg:border-r p-5 h-[20em]">
              <HourBlobFeeAccountChart account={account} duration={duration} />
            </div>
            <div className=" p-5 h-[20em]">
              <HourTxnsBlobAccountChart account={account} duration={duration} />
            </div>
          </div>
          {/* <div className="grid lg:grid-cols-2 lg:h-[20em] ">
            <div className="border-base-200 border-r p-5 h-[20em]">
              <DayBlobSizeAccountChart account={account} duration={duration} />
            </div>
            <div className="border-base-200 border-r p-5 h-[20em]">
              <DayBlobSizeAccountChart account={account} duration={duration} />
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}

export default AccountDayStats;
