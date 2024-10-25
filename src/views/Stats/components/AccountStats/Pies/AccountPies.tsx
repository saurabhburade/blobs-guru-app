"use client";
import { TOP_FIVE_BLOB_ACCOUNTS_QUERY } from "@/lib/apollo/queries";
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
          <AccountsBySizePie
            collectiveData={{
              id: "1",
              totalBlobTransactionCount: "1733041",
              totalGasEth: "2243027933299938165023",
              lastUpdatedBlock: "21042836",
              totalFeeEth: "2243027933299938165023",
              totalBlobGasEth: "1025428177100810223616",
              totalBlobHashesCount: "3459857",
              totalBlobBlocks: "914622",
              totalBlobAccounts: "5872",
              totalBlobGas: "453490376704",
              __typename: "CollectiveData",
            }}
          />
        </div>
        <div className="border-base-200 border-t lg:border-t-0 lg:border-r lg:h-[20em] ">
          <AccountsByBlobsPie
            collectiveData={{
              id: "1",
              totalBlobTransactionCount: "1733041",
              totalGasEth: "2243027933299938165023",
              lastUpdatedBlock: "21042836",
              totalFeeEth: "2243027933299938165023",
              totalBlobGasEth: "1025428177100810223616",
              totalBlobHashesCount: "3459857",
              totalBlobBlocks: "914622",
              totalBlobAccounts: "5872",
              totalBlobGas: "453490376704",
              __typename: "CollectiveData",
            }}
          />
        </div>
      </div>
      <div className=" border-base-200  grid lg:grid-cols-2 border-t">
        <div className="border-base-200 border-r lg:h-[20em]">
          <AccountsByFeePie
            collectiveData={{
              id: "1",
              totalBlobTransactionCount: "1733041",
              totalGasEth: "2243027933299938165023",
              lastUpdatedBlock: "21042836",
              totalFeeEth: "2243027933299938165023",
              totalBlobGasEth: "1025428177100810223616",
              totalBlobHashesCount: "3459857",
              totalBlobBlocks: "914622",
              totalBlobAccounts: "5872",
              totalBlobGas: "453490376704",
              __typename: "CollectiveData",
            }}
          />
        </div>
        <div className="border-base-200 border-t lg:border-t-0 lg:border-r lg:h-[20em] ">
          <AccountsByTransactionPie
            collectiveData={{
              id: "1",
              totalBlobTransactionCount: "1733041",
              totalGasEth: "2243027933299938165023",
              lastUpdatedBlock: "21042836",
              totalFeeEth: "2243027933299938165023",
              totalBlobGasEth: "1025428177100810223616",
              totalBlobHashesCount: "3459857",
              totalBlobBlocks: "914622",
              totalBlobAccounts: "5872",
              totalBlobGas: "453490376704",
              __typename: "CollectiveData",
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default AccountPies;
