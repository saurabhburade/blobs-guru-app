"use client";
import { TOP_FIVE_BLOB_ACCOUNTS_QUERY } from "@/lib/apollo/queries";
import { formatBytes } from "@/lib/utils";
import AccountStatCard from "@/views/Accounts/components/AccountStatCard";
import { useQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

const TopAccountsStats = () => {
  const { data } = useQuery(TOP_FIVE_BLOB_ACCOUNTS_QUERY);

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
      <div className="h-fit  grid lg:grid-cols-2 ">
        {data?.accounts?.map((acc: any) => {
          return (
            <AccountStatCard key={acc?.id} acc={acc} className="rounded-none" />
          );
        })}
      </div>
    </div>
  );
};
export default TopAccountsStats;
