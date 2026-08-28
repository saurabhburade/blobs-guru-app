"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BigNumber from "bignumber.js";
import { CELESTIA_STATS_API_URL } from "@/configs/env";
import { THROUGHPUT_DATA_CELESTIA } from "@/mock/mockCelestiaAPI";
import { THROUGHPUT_DATA_EIGENDA } from "@/mock/mockEigenAPI";

export const useCelestiaDaThroughput = () => {
  const res = useQuery({
    queryKey: ["useCelestiaDaThroughput"],
    queryFn: async () => {
      const currentTimestamp =
        parseInt((new Date().getTime() / 1000).toString()) - 86400;

      const r = await axios.get(
        `${CELESTIA_STATS_API_URL}?from=${currentTimestamp}`,
      );
      const formatedData = r?.data?.map(
        (d: { time: string; value: string }) => {
          return {
            timestamp: d.time,
            value: new BigNumber(d.value)
              .div(1024)
              .div(1024)
              .div(3600)
              .toNumber(),
          };
        },
      );
      return { series: formatedData };
    },
  });
  return res;
};
