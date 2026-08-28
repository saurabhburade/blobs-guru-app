"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BigNumber from "bignumber.js";
import { EIGENDA_API_URL } from "@/configs/env";
import { THROUGHPUT_DATA_EIGENDA } from "@/mock/mockEigenAPI";

export const useEigenDaThroughput = () => {
  const res = useQuery({
    queryKey: ["useEigenDaThroughput"],
    queryFn: async () => {
      const currentTimestamp = parseInt(
        (new Date().getTime() / 1000).toString(),
      );

      const r = await axios.get(EIGENDA_API_URL, {
        params: {
          batch: 1,
          input: JSON.stringify({
            "0": {
              json: {
                start: currentTimestamp - 84600,
                end: currentTimestamp,
              },
            },
            "1": {
              json: {
                start: currentTimestamp - 84600,
                end: currentTimestamp,
              },
            },
          }),
        },
      });
      const cummdata = {};
      r.data[0].result.data.json?.forEach(
        (element: { x: number; y: number }) => {
          const hourID = parseInt((element.x / 3600).toString());

          // Base date (Unix epoch)
          const baseDate = new Date(0); // January 1, 1970

          // Calculate total milliseconds
          const totalMilliseconds = hourID * 60 * 60;

          // Create a new date by adding the milliseconds to the base date
          const hourTimestamp = new Date(
            baseDate.getTime() + totalMilliseconds,
          ).getTime();
          // @ts-expect-error
          if (!cummdata[hourID]) {
            // @ts-expect-error
            cummdata[hourID] = {
              ...element,
              timestamp: hourTimestamp,
              value: new BigNumber(element.y).div(1024).div(1024).toNumber(),
              y: new BigNumber(element.y).div(1024).div(1024).toNumber(),
              hourTimestamp,
            };
          } else {
            // @ts-expect-error
            cummdata[hourID] = {
              // @ts-expect-error
              ...cummdata[hourID],
              timestamp: hourTimestamp,
              value: new BigNumber(element.y)
                .div(1024)
                .div(1024)
                // @ts-expect-error
                .plus(cummdata[hourID].value)
                .div(2)
                .toNumber(),
              y: new BigNumber(element.y).div(1024).div(1024).toNumber(),

              hourTimestamp,
            };
          }
        },
      );

      // const formatedData = THROUGHPUT_DATA_EIGENDA[0].result.data.json?.map(
      //   (d) => {
      //     return {
      //       timestamp: d.x,
      //       value: new BigNumber(d.y).div(1024).div(1024).toNumber(),
      //     };
      //   }
      // );
      return { series: Object.values(cummdata) };
    },
  });
  return res;
};
