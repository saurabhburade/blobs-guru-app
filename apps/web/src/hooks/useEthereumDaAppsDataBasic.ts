import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import _ from "lodash";
import {
  getAccountDetailsFromAddressBook,
  getAppDetailsFromAppBook,
} from "@/configs/constants";
import { joinUrl, L2BEAT_RAW_DATA_BASE_URL } from "@/configs/env";
import { apolloClient, celestiaClient } from "@/lib/apollo/client";
import { CELESTIA_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesCelestia";
import { ETHEREUM_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesEthereum";
export interface ApplicationData {
  name: string;
  id: number;
  owner: string;
}
export const useEthereumDaAppsDataBasic = () => {
  const { data, loading, error } = useQuery(ETHEREUM_BASIC_APP_DATAS_QUERY, {
    pollInterval: 15_000, // Every 15 sec
    client: apolloClient,
  });
  const appDatasMap = new Map<string, any>();

  const { data: appDatasL2beat, ...other } = useReactQuery({
    queryKey: ["home-l2beat-ethereum-apps"],
    queryFn: async () => {
      const datas = await Promise.all(
        data?.accountEntities?.nodes?.map(async (agg: any) => {
          return await fetch(
            joinUrl(
              L2BEAT_RAW_DATA_BASE_URL,
              `projects/with-da-id/ethereum/ethereum/${(agg?.id as string)?.toLowerCase()}.json`,
            ),
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
        }),
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
  const formattedOp = data?.accountEntities?.nodes?.map((agg: any) => {
    const decoded = agg?.id;

    const app =
      appDatasMap?.get((agg?.id as string)?.toLowerCase()) ??
      getAccountDetailsFromAddressBook((agg?.id as string)?.toLowerCase());

    return {
      ...agg,
      name: app?.name ?? decoded,
      logoUri: app?.logoUri,
    };
  });

  return {
    data: {
      formattedOp: _.take(
        _.orderBy(formattedOp, (s) => Number(s?.byteSize), ["asc"]),
        4,
      ),
      totalCount: data?.dataSubmissions?.totalCount,
    },
    loading: loading,
    ...other,
  };
};
export const useEthereumDaAppsDataBasicSingle = (id: string) => {
  const {
    data: appDatasL2beat,
    isLoading: loading,
    ...other
  } = useReactQuery({
    queryKey: ["l2beat-ethereum-apps-list", id],
    queryFn: async () => {
      return await fetch(
        joinUrl(
          L2BEAT_RAW_DATA_BASE_URL,
          `projects/with-da-id/ethereum/ethereum/${(id as string)?.toLowerCase()}.json`,
        ),
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
    appDatasL2beat ??
    getAccountDetailsFromAddressBook((id as string)?.toLowerCase());

  return {
    data: {
      ...formattedOp,
    },
    loading: loading,
    ...other,
  };
};
