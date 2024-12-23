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
  const { data, loading } = useQuery(AVAIL_BASIC_APP_DATAS_QUERY, {
    pollInterval: 15_000, // Every 15 sec
    client: availClient,
  });
  const { data: appDatasRes, isLoading } = useReactQuery({
    queryKey: ["useAvailDaAppsDataBasic"],
    queryFn: async () => {
      const api = await initialize("wss://mainnet.avail-rpc.com/");
      const entries = await api.query.dataAvailability.appKeys.entries();

      const appDatas: ApplicationData[] = entries.map(([key, value]: any) => {
        const name = key.args[0].toHuman() as string;
        const appKey = value.toHuman() as {
          owner: string;
          id: string | number;
        };

        return {
          name,
          owner: appKey.owner,
          id: Number(appKey.id),
        };
      });
      return appDatas;
    },
  });

  const formattedOp = data?.dataSubmissions?.groupedAggregates?.map((agg:any) => {
    const foundApp = appDatasRes?.find(
      (app) => Number(app.id) === Number(agg?.keys[0])
    );

    return {
      key: agg?.keys[0],
      ...agg?.sum,
      distinctCount: agg?.distinctCount,
      ...foundApp,
    };
  });

  return {
    data: {
      formattedOp: _.take(
        _.orderBy(formattedOp, (s) => Number(s?.byteSize), ["desc"]),
        4
      ),
      totalCount: data?.dataSubmissions?.totalCount,
    },
    loading: loading || isLoading,
  };
};
