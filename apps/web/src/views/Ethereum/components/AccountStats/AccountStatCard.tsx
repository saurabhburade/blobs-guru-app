import BigNumber from "bignumber.js";
import {
  Coins,
  Database,
  HardDriveUpload,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import { cn, formatAddress, formatBytes } from "@/lib/utils";

type Props = {};
function AccountStatCard({ acc, isLoading, className }: any) {
  const accountDetails = getAccountDetailsFromAddressBook(acc?.id);
  const totalBlobSize = useMemo(() => {
    return formatBytes(Number(acc?.totalByteSize));
  }, [acc?.totalByteSize]);
  const executionWei = new BigNumber(
    acc?.executionFeesWei ?? acc?.totalFeesNative ?? 0,
  );
  const blobWei = new BigNumber(acc?.blobFeesWei ?? acc?.totalDAFees ?? 0);
  const combinedWei = executionWei.plus(blobWei);
  const executionUsd = new BigNumber(acc?.totalFeesUSD ?? 0);
  const blobUsd = new BigNumber(acc?.totalDAFeesUSD ?? 0);

  return (
    <div
      className={cn(
        "bg-base-100/80 border-base-300/30 border rounded-lg ",
        className ? className : "",
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

            <Link href={`/ethereum/${acc?.id}`}>
              {accountDetails?.name ? (
                <p className=""> {accountDetails?.name}</p>
              ) : (
                <>
                  <p className="hidden lg:block"> {acc?.id}</p>
                  <p className="lg:hidden block"> {formatAddress(acc?.id)}</p>
                </>
              )}
            </Link>
          </>
        )}
      </div>
      <div className=" grid lg:grid-cols-2">
        {isLoading && (
          <div className="border-r border-x-base-200/50">
            {["first", "second", "third", "fourth"].map((placeholder) => {
              return (
                <div
                  className="flex justify-between items-center p-4 py-4"
                  key={placeholder}
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
                  Number(acc?.totalDataSubmissionCount || 0),
                )?.toFormat()}
              </p>
            </div>

            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true`}
                  width={24}
                  height={24}
                  alt="ethereum"
                />
                <p className=""> Blob DA Fees</p>
              </div>
              <p className="text-xl font-bold">
                {blobWei.div(1e18).toFormat(2)} ETH
              </p>
            </div>
            <div className="flex justify-between items-center  py-3 p-4">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true`}
                  width={24}
                  height={24}
                  alt="ethereum"
                  className="rounded-lg"
                />
                <p className=""> Blob DA Fees USD</p>
              </div>
              <p className="text-xl font-bold">
                ${blobUsd.div(1e18).toFormat(2)}{" "}
              </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <p>Blob Txn Gas Fees</p>
              <p className="text-xl font-bold">
                {executionWei.div(1e18).toFormat(2)} ETH
              </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <p>Blob Txn Gas Fees USD</p>
              <p className="text-xl font-bold">
                ${executionUsd.div(1e18).toFormat(2)}
              </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <p>Total Blob Txn Fees</p>
              <p className="text-xl font-bold">
                {combinedWei.div(1e18).toFormat(2)} ETH
              </p>
            </div>
            <div className="flex justify-between items-center p-4">
              <p>Total Blob Txn Fees USD</p>
              <p className="text-xl font-bold">
                ${executionUsd.plus(blobUsd).div(1e18).toFormat(2)}
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
