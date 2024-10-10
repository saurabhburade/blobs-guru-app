import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import { formatAddress, formatBytes } from "@/lib/utils";
const labelOption = {
  show: true,

  formatter: "{c}  {name|{a}}",
  fontSize: 16,
  rich: {
    name: {},
  },
};
const TopAccountsChart: React.FC = () => {
  const { data } = useQuery(TOP_FIVE_BLOB_ACCOUNTS_QUERY);
  const memoOption = useMemo(() => {
    const datas = data?.accounts?.map((bd: any) => {
      return {
        ...bd,
        sizeValue: bd?.totalBlobGas,
        Size: formatBytes(Number(bd?.totalBlobGas)),
        formattedAddress: formatAddress(bd?.id),
        value: bd?.totalBlobTransactionCount,
        name: formatAddress(bd?.id),
      };
    });
    const option = {
      title: {
        text: "World Population",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {},
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: "category",
        data: datas?.map((a: any) => a?.formattedAddress),
      },
      series: [
        {
          name: "2011",
          type: "bar",
          data: datas?.map((a: any) => Number(a?.value)),
          label: labelOption,
        },
        {
          name: "2012",
          type: "bar",
          label: {
            show: true,

            formatter: "{c}  {name|{a}}",
            fontSize: 12,
            rich: {
              name: {},
            },
          },
          data: datas?.map((a: any) => Number(a?.totalBlobGas) / 102400),
        },
      ],
    };
    return option;
  
  }, [data?.accounts]);

  return (
    <ReactECharts
      option={memoOption}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default TopAccountsChart;
