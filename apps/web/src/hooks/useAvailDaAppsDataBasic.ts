import { AVAIL_APP_BOOK } from "@/configs/availProjects";
import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_ACCOUNT_EXT_LIMIT_QUERY,
  AVAIL_BASIC_APP_DATAS_QUERY,
  AVAIL_BLOCKS_DA_SUM_QUERY,
  AVAIL_BLOCKS_WITH_LIMIT_QUERY,
  AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesAvail";
import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { initialize, isValidAddress } from "avail-js-sdk";
import _ from "lodash";
export interface ApplicationData {
  name: string;
  id: number;
  owner: string;
}
export const useAvailDaAppsDataBasic = () => {
  const { data, loading, error } = useQuery(AVAIL_BASIC_APP_DATAS_QUERY, {
    pollInterval: 15_000, // Every 15 sec
    client: availClient,
  });
  const appDatasMap = new Map<string, any>();

  const { data: appDatasL2beat, ...other } = useReactQuery({
    queryKey: ["home-l2beat-avail-apps"],
    queryFn: async () => {
      const datas = await Promise.all(
        data?.appEntities?.nodes?.map(async (agg: any) => {
          return await fetch(
            `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/avail/avail/${(agg?.id as string)?.toLowerCase()}.json`
          )
            ?.then(async (res) => {
              const result = await res.json();
              if (result) {
                return {
                  ...result,
                  address: (agg?.id as string)?.toLowerCase(),
                  logoUri: `https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/icons/${(result?.display?.slug as string)?.toLowerCase()}.png`,
                  name: result?.display?.name,
                };
              }
              return null;
            })
            .catch(() => null);
        })
      );

      return datas;
    },
  });
  if (appDatasL2beat) {
    appDatasL2beat.forEach((app: any) => {
      if (!app) return;
      appDatasMap.set((app?.address as string)?.toLowerCase(), app);
    });
  }
  const formattedOp = data?.appEntities?.nodes?.map((agg: any) => {
    let decoded = agg?.id;

    const app =
      appDatasMap?.get((agg?.id as string)?.toLowerCase()) ??
      AVAIL_APP_BOOK[(agg?.id as string)?.toLowerCase()];

    return {
      ...agg,
      name: app?.name ?? decoded,
      logoUri: app?.logoUri,
    };
  });

  return {
    data: {
      formattedOp: _.take(
        _.orderBy(formattedOp, (s) => Number(s?.totalByteSize), ["desc"]),
        4
      ),
      totalCount: data?.dataSubmissions?.totalCount,
    },
    loading: loading,
    ...other,
  };
};
export const useAvailDaAppsDataBasicSingle = (id: string) => {
  const { data: appDatasL2beat, ...other } = useReactQuery({
    queryKey: ["home-l2beat-avail-apps", id],
    queryFn: async () => {
      return await fetch(
        `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/avail/avail/${(id as string)?.toLowerCase()}.json`
      )
        ?.then(async (res) => {
          const result = await res.json();
          if (result) {
            return {
              ...result,
              address: (id as string)?.toLowerCase(),
              logoUri: `https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/icons/${(result?.display?.slug as string)?.toLowerCase()}.png`,
              name: result?.display?.name,
            };
          }
          return null;
        })
        .catch(() => null);
    },
  });

  const formattedOp =
    appDatasL2beat ?? AVAIL_APP_BOOK[(id as string)?.toLowerCase()];

  return {
    data: formattedOp,
    ...other,
  };
};
