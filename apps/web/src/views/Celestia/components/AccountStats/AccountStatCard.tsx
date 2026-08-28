import {
  Coins,
  Database,
  HardDriveUpload,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import React, { useMemo } from "react";

import {
  cn,
  formatAddress,
  formatBytes,
  parseCelestiaString,
} from "@/lib/utils";
import BigNumber from "bignumber.js";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";

import Link from "next/link";

import ImageWithFallback from "@/components/ImageWithFallback";

type Props = {};
function AccountStatCard({ acc, isLoading, className }: any) {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalByteSize));
  }, [acc?.totalByteSize]);

  return (
    <div
      className={cn(
        "bg-base-100/80 border-base-300/30 border rounded-lg ",
        className ? className : ""
      )}
    >
      <div className="flex gap-2 items-center border-b border-base-200/50  h-[4em] p-4">
        {isLoading && (
          <>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[3em] h-[3em] animate-pulse"></div>
            <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[12em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
          </>
        )}
        {!isLoading && (
          <>
            <User
              width={40}
              height={40}
              className="bg-base-200 p-2 rounded-lg"
            />

            <Link href={`/celestia/${parseCelestiaString(acc?.id)}`}>
              {accountDetails?.name ? (
                <p className=""> {accountDetails?.name}</p>
              ) : (
                <>
                  <p className="hidden lg:block">
                    {" "}
                    {parseCelestiaString(acc?.id)}
                  </p>
                  <p className="lg:hidden block">
                    {" "}
                    {formatAddress(parseCelestiaString(acc?.id))}
                  </p>
                </>
              )}
            </Link>
          </>
        )}
      </div>
      <div className=" grid lg:grid-cols-2">
        {isLoading && (
          <div className="border-r border-x-base-200/50">
            {new Array(4).fill(1)?.map((num, idx) => {
              return (
                <div
                  className="flex justify-between items-center p-4 py-4"
                  key={`AccountStatCard_${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[2em] h-[2em] animate-pulse"></div>

                    <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em] lg:w-[8em] lg:w-[10em] h-[22px] animate-pulse"></div>
                  </div>

                  <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[2em] lg:w-[5em] lg:w-[10em] h-[22px] animate-pulse"></div>
                </div>
              );
            })}
          </div>
        )}
        {!isLoading && (
          <div className="border-r border-x-base-200/50">
            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <NotepadText />
                <p className=""> Transactions Count</p>
              </div>
              <p className="text-xl font-bold">
                {new BigNumber(Number(acc?.totalTxnCount || 0))?.toFormat()}
              </p>
            </div>

            <div className="flex justify-between items-center py-3 p-4">
              <div className="flex items-center gap-2">
                <Database />

                <p className=""> DA size</p>
              </div>
              <p className="text-xl font-bold"> {totalBlobSize} </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <HardDriveUpload />
                <p className=""> Total DA subs</p>
              </div>
              <p className="text-xl font-bold">
                {" "}
                {new BigNumber(
                  Number(acc?.totalDataSubmissionCount || 0)
                )?.toFormat()}
              </p>
            </div>

            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/celestia.png?raw=true`}
                  width={24}
                  height={24}
                  alt="celestia"
                />
                <p className=""> DA Fees</p>
              </div>
              <p className="text-xl font-bold">
                {new BigNumber(Number(acc?.totalDAFees || 0))?.toFormat(4)} TIA
              </p>
            </div>
          </div>
        )}
        {/* <div className="p-5  bg-base-100/50    border-base-300/20 w-full ">
          {acc?.id && !isLoading && <AccountExtChart account={acc?.id} />}
        </div> */}
      </div>
    </div>
  );
}

export default AccountStatCard;
