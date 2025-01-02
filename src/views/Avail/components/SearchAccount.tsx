import ImageWithFallback from "@/components/ImageWithFallback";
import { availClient } from "@/lib/apollo/client";
import { AVAIL_ACCOUNT_SEARCH, AVAIL_SEARCH } from "@/lib/apollo/queriesAvail";
import { formatAddress, formatBytes, formatWrapedText } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { isValidAddress } from "avail-js-sdk";

import Link from "next/link";
import React, { useState } from "react";

type Props = {};

function SearchAccount({}: Props) {
  const [addressQuery, setAddressQuery] = useState("");
  const [hash, setHash] = useState("");

  const { data, loading, error } = useQuery(AVAIL_SEARCH, {
    variables: {
      address: hash,
      query: hash,
    },
    client: availClient,
  });

  return (
    <div className="dropdown w-full lg:w-2/3">
      <div tabIndex={0} role="button" className=" w-full">
        <div className="join  w-full  ">
          <input
            className="input w-full input-bordered outline-none active:outline-none placeholder:text-sm focus:outline-none join-item  "
            placeholder="Search Account / App"
            value={addressQuery}
            onChange={(e) => {
              const v = e.target.value;
              // if (v?.length <= 48) {
              setAddressQuery(v?.toString());
              // }
              // if (v?.length === 48 && isValidAddress(v)) {
              setHash(v?.toString());
              // } else {
              //   setHash("");
              // }
            }}
          />
          <button className="btn join-item rounded-r-full">Search</button>
        </div>
      </div>
      {addressQuery && addressQuery?.trim() !== "" && (
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full mt-1 p-2 shadow border border-base-200"
        >
          {data?.accountEntities?.nodes?.map((d: any) => {
            return (
              <li key={d?.id}>
                <Link
                  href={`/avail/${d?.id}`}
                  className="w-full hover:!bg-base-200/50"
                >
                  <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
                    <ImageWithFallback
                      src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
                      className="rounded-lg"
                      width={24}
                      height={24}
                      alt=""
                    />
                  </div>
                  <p className="text-primary">{formatAddress(d?.id)}</p>
                </Link>
              </li>
            );
          })}
          {data?.appEntities?.nodes?.map((d: any) => {
            return (
              <li key={d?.id}>
                <Link
                  href={`/avail/apps/${d?.id}`}
                  className="w-full hover:!bg-base-200/50"
                >
                  <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[44px] h-[44px]">
                    <ImageWithFallback
                      src={`https://github.com/l2beat/l2beat/blob/main/packages/frontend/public/icons/avail.png?raw=true`}
                      className="rounded-lg"
                      width={24}
                      height={24}
                      alt=""
                    />
                  </div>
                  <p className="text-primary">
                    {formatWrapedText(d?.name, 6, 6)}
                  </p>
                </Link>
              </li>
            );
          })}

          {!loading &&
            data?.accountEntities?.nodes?.length <= 0 &&
            data?.appEntities?.nodes?.length <= 0 && (
              <li>
                <div className="p-5 hover:!bg-transparent">Invalid query</div>
              </li>
            )}
          {loading && (
            <li className="hover:!bg-transparent">
              <div className="w-full hover:!bg-transparent">
                <AccountRowSkeleton />
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchAccount;

const AccountRowSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.5fr] items-center lg:flex-nowrap first:border-t-0 border-t py-3 border-base-200 text-sm">
      <div className="flex items-center gap-2 w-full">
        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[4em] h-[4em] animate-pulse"></div>
        <div className="space-y-2">
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] lg:w-[10em] h-[20px] animate-pulse"></div>
          <div className=" bg-base-200/50 flex justify-center rounded-xl items-center  w-[5em]  lg:w-[8em] h-[20px] animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 w-full flex items-end flex-col justify-end ">
        <div className=" bg-base-200/50 flex justify-end rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>

        <div className=" bg-base-200/50 flex justify-center rounded-xl items-center w-[5em] h-[20px] animate-pulse"></div>
      </div>
    </div>
  );
};
