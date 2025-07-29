import {
  getAccountDetailsFromAddressBook,
  getAppDetailsFromAppBook,
} from "@/configs/constants";
import { apolloClient, celestiaClient } from "@/lib/apollo/client";

import { CELESTIA_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesCelestia";
import { ETHEREUM_BASIC_APP_DATAS_QUERY } from "@/lib/apollo/queriesEthereum";
import { useQuery } from "@apollo/client";

import _ from "lodash";
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

  const appDatasRes = [];

  const formattedOp = data?.accountEntities?.nodes?.map((agg: any) => {
    let decoded = agg?.id;
    const name = getAccountDetailsFromAddressBook(
      (agg?.id as string)?.toLowerCase()
    );
    return {
      ...agg,
      name: name?.name ?? decoded,
      logoUri: name?.logoUri,
    };
  });

  return {
    data: {
      formattedOp: _.take(
        _.orderBy(formattedOp, (s) => Number(s?.byteSize), ["asc"]),
        4
      ),
      totalCount: data?.dataSubmissions?.totalCount,
    },
    loading: loading,
  };
};
