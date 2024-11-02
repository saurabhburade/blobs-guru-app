"use client";

import Header from "@/components/Header/Header";
import { useEigenDaThroughput } from "@/hooks/useEigenDa";
import React, { useMemo } from "react";
import EigenDA from "./EigenDA/EigenDA";
import CelestiaDA from "./Celestia/CelestiaDA";
import ETHBlobsDA from "./ETHBlobsDA/ETHBlobsDA";
import BigNumber from "bignumber.js";
import { useCelestiaDaThroughput } from "@/hooks/useCelestiaDa";
import { useQuery } from "@apollo/client";
import { BLOB_HOUR_DATAS_QUERY } from "@/lib/apollo/queries";
import DAThroughputsChart from "./DACompareChart/DAThroughputsChart";

type Props = {};

function DataAvailability({}: Props) {
  const celestiaResult = useCelestiaDaThroughput();
  const eigenResult = useEigenDaThroughput();
  const { data: eip4844Result } = useQuery(BLOB_HOUR_DATAS_QUERY, {
    variables: {
      duration: 24,
    },
  });

  const lastHourDataCelestia = useMemo(() => {
    const lastItem = celestiaResult?.data?.series?.at(-1);
    if (lastItem) {
      return {
        ...lastItem,
        valueF: new BigNumber(lastItem.value).toFormat(3),
      };
    }
    return {};
  }, [celestiaResult.data]);
  const lastHourDataEigen = useMemo(() => {
    const lastItem = eigenResult?.data?.series?.at(-1);
    if (lastItem) {
      return {
        ...lastItem,

        //   @ts-ignore
        valueF: new BigNumber(lastItem?.value).toFormat(3),
      };
    }
    return {};
  }, [eigenResult.data]);
  const lastHourDataEIP4844 = useMemo(() => {
    const lastItem = eip4844Result?.blobsHourDatas?.at(-1);
    if (lastItem) {
      return {
        ...lastItem,

        mibPerSecF: new BigNumber(Number(lastItem?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(3600)
          .toFormat(4),
        valueF: new BigNumber(Number(lastItem?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(3600)
          .toFormat(4),
        mibPerSec: new BigNumber(Number(lastItem?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(3600)
          .toNumber(),
        value: new BigNumber(Number(lastItem?.totalBlobGas))
          .div(1024)
          .div(1024)
          .div(3600)
          .toNumber(),
      };
    }
    return {};
  }, [eip4844Result?.blobsHourDatas]);

  return (
    <div>
      <Header />
      <div className="mx-auto lg:p-20 p-4 min-h-[90vh] flex flex-col space-y-8 pb-10 bg-gradient-to-b from-transparent via-indigo-500/20">
        <div className="w-full space-y-4">
          <DAThroughputsChart
            lastHourDataEigen={lastHourDataEigen}
            dEigen={eigenResult}
            lastHourDataCelestia={lastHourDataCelestia}
            dCelestia={celestiaResult}
            dEip4844={eip4844Result}
            lastHourDataEIP4844={lastHourDataEIP4844}
          />
          <EigenDA lastHourDataEigen={lastHourDataEigen} d={eigenResult} />
          <CelestiaDA
            lastHourDataCelestia={lastHourDataCelestia}
            d={celestiaResult}
          />
          <ETHBlobsDA
            d={eip4844Result}
            lastHourDataEIP4844={lastHourDataEIP4844}
          />
        </div>
      </div>
    </div>
  );
}

export default DataAvailability;
