import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_ACCOUNT_EXT_LIMIT_QUERY,
  AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
  AVAIL_DAY_DATAS_WITH_DURATION_WITH_ACCOUNTS_QUERY,
} from "@/lib/apollo/queriesAvail";
import { useQuery } from "@apollo/client";
const LIMIT_PER_PAGE = 10;
export const useAvailDayStatsWithAccounts = ({
  duration,
}: {
  duration: number;
}) => {
  const { data, loading } = useQuery(
    AVAIL_DAY_DATAS_WITH_DURATION_WITH_ACCOUNTS_QUERY,
    {
      variables: {
        limit: LIMIT_PER_PAGE,
        duration: duration,
      },
      pollInterval: 15_000, // Every 15 sec
      client: availClient,
    }
  );
  const extIds = data?.extrinsics?.nodes?.map((ext: any) => `${ext?.id}`);
  console.log(
    `🚀 ~ file: useAvailAccountExt.ts:27 ~ data:`,
    data?.extrinsics?.nodes,
    { extIds }
  );
  const { data: daSubs, loading: daSubsloading } = useQuery(
    AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
    {
      skip: extIds?.length <= 0,
      variables: {
        extrinsicIds: extIds,
      },

      client: availClient,
    }
  );
  const filteredData = data?.extrinsics?.nodes?.map((ext: any) => {
    const foundDa = daSubs?.dataSubmissions?.nodes?.find(
      (d: any) => d.extrinsicId === `${ext?.id}`
    );
    return { ...ext, dataSubmission: foundDa };
  });

  return { data: filteredData, loading: loading || daSubsloading };
};
