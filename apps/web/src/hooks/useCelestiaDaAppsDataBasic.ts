import { celestiaClient } from "@/lib/apollo/client";

import { CELESTIA_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesCelestia";
import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";

import _ from "lodash";
export interface ApplicationData {
  name: string;
  id: number;
  owner: string;
}
export const useCelestiaDaAppsDataBasic = () => {
  const { data, loading, error } = useQuery(CELESTIA_BASIC_APP_DATAS_QUERY, {
    pollInterval: 15_000, // Every 15 sec
    client: celestiaClient,
  });
  const appDatasMap = new Map<string, any>();

  const { data: appDatasL2beat, ...other } = useReactQuery({
    queryKey: ["home-l2beat-celestia-apps"],
    queryFn: async () => {
      const datas = await Promise.all(
        data?.appEntities?.nodes?.map(async (agg: any) => {
          console.log(`🚀 ~ useCelestiaDaAppsDataBasic.ts:25 ~ agg:`, agg);
          return await fetch(
            `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/celestia/celestia/${(agg?.name as string)?.toLowerCase()}.json`
          )
            ?.then(async (res) => {
              const result = await res.json();

              if (result) {
                return {
                  ...result,
                  address: (agg?.name as string)?.toLowerCase(),
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

    const app = appDatasMap?.get((agg?.name as string)?.toLowerCase()) ?? null;

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
export const useCelestiaDaAppsDataBasicSingle = (id: string) => {
  const { data: appDatasL2beat, ...other } = useReactQuery({
    queryKey: ["l2beat-celestia-apps", id],
    queryFn: async () => {
      return await fetch(
        `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/celestia/celestia/${(id as string)?.toLowerCase()}.json`
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
  const formattedOp = appDatasL2beat ?? null;
  return {
    data: formattedOp,
    ...other,
  };
};
