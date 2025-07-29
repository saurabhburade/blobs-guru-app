import { celestiaClient } from "@/lib/apollo/client";

import { CELESTIA_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesCelestia";
import { useQuery } from "@apollo/client";

import _ from "lodash";
export interface ApplicationData {
  name: string;
  id: number;
  owner: string;
}
export const useCelestiaDaAppsDataBasic = () => {
  const { data, loading } = useQuery(CELESTIA_BASIC_APP_DATAS_QUERY, {
    pollInterval: 15_000, // Every 15 sec
    client: celestiaClient,
  });

  const appDatasRes = [];

  const formattedOp = data?.appEntities?.nodes?.map((agg: any) => {
    let decoded = agg?.id;

    if (typeof window !== "undefined") {
      decoded = atob(agg?.id);
    }
    return {
      ...agg,
      name: decoded,
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
    loading: loading,
  };
};
