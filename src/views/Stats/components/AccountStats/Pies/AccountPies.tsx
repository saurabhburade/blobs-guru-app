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
import AccountsBySizePie from "./AccountsBySizePie";
import AccountsByBlobsPie from "./AccountsByBlobsPie";
import AccountsByFeePie from "./AccountsByFeePie";
import AccountsByTransactionPie from "./AccountsByTransactionPie";

const AccountPies = () => {
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
    <div className=" h-fit border border-base-200 rounded-lg p-1">
      <div className="  grid lg:grid-cols-2 ">
        <div className="border-base-200 border-r lg:h-[20em]">
          <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
            <p className="text-xs p-3 border-b border-base-200 ">
              Size Distribution
            </p>

            <AccountsBySizePie
              collectiveData={collectiveData?.collectiveData}
            />
          </div>
        </div>
        <div className="border-base-200 border-t w-full lg:border-t-0 lg:h-[20em] ">
          <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
            <p className="text-xs p-3 border-b border-base-200 ">
              Blobs Distribution
            </p>

            <AccountsByBlobsPie
              collectiveData={collectiveData?.collectiveData}
            />
          </div>
        </div>
      </div>
      <div className="  grid lg:grid-cols-2 ">
        <div className="border-base-200 border-t  lg:border-r  lg:h-[20em]">
          <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
            <p className="text-xs p-3 border-b border-base-200 ">
              Fee Distribution
            </p>

            <AccountsByFeePie collectiveData={collectiveData?.collectiveData} />
          </div>
        </div>
        <div className="border-base-200 border-t w-full lg:h-[20em] ">
          <div className="  lg:h-[20em] bg-base-100 rounded-lg ">
            <p className="text-xs p-3 border-b border-base-200 ">
              Transactions Distribution
            </p>

            <AccountsByTransactionPie
              collectiveData={collectiveData?.collectiveData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountPies;
