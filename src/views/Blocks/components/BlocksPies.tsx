"use client";
import {
  COLLECTIVE_STAT_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatBytes } from "@/lib/utils";
import AccountStatCard from "@/views/Accounts/components/AccountStatCard";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

import AccountsByBlocksPie from "./AccountsByBlocksPie";

const BlocksPies = () => {
  const { data } = useQuery(TOP_FIVE_BLOB_ACCOUNTS_QUERY);
  const { data: collectiveData, loading: statsLoading } = useQuery(
    COLLECTIVE_STAT_QUERY
  );

  const chartData = useMemo(() => {
    const datas = data?.accounts?.map((bd: any) => {
      const totalFeeEth = new BigNumber(bd?.totalFeeEth).div(1e18).toFormat(2);
      const lastUpdatedBlock = new BigNumber(bd?.lastUpdatedBlock).toFormat(0);
      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        size: formatBytes(Number(bd?.totalBlobGas)),
        totalFeeEth,
        lastUpdatedBlock,
      };
    });
    return datas;
  }, [data?.accounts]);

  return (
    <div className=" h-fit ">
      <div className="  grid lg:grid-cols-2 ">
        <div className="border-base-200 border-r lg:h-[20em]">
          <AccountsByBlocksPie
            collectiveData={collectiveData?.collectiveData}
          />
        </div>
        <div className="border-base-200 border-t lg:border-t-0 lg:border-r lg:h-[20em] ">
          <AccountsByBlocksPie
            collectiveData={collectiveData?.collectiveData}
          />
        </div>
      </div>
    </div>
  );
};
export default BlocksPies;
