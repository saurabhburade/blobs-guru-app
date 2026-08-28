import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_ACCOUNT_EXT_LIMIT_QUERY,
  AVAIL_BLOCKS_DA_SUM_QUERY,
  AVAIL_BLOCKS_WITH_LIMIT_QUERY,
  AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesAvail";
import { useQuery } from "@apollo/client";
export const useAvailUtilisation = ({ limit }: { limit: number }) => {
  const { data, loading } = useQuery(AVAIL_BLOCKS_WITH_LIMIT_QUERY, {
    variables: {
      limit,
    },
    pollInterval: 15_000, // Every 15 sec
    client: availClient,
  });
  const timestamps = data?.blocks?.nodes?.map((blk: any) => blk?.timestamp);
  const { data: daSubs, loading: daSubsloading } = useQuery(
    AVAIL_BLOCKS_DA_SUM_QUERY,
    {
      skip: timestamps?.length <= 0,
      variables: {
        timestamps: timestamps,
      },
      client: availClient,
    }
  );

  return {
    data: {
      ...daSubs?.dataSubmissions?.aggregates?.sum,
      totalCount: daSubs?.dataSubmissions?.totalCount,
      blocks: data?.blocks?.nodes,
    },
    loading: loading || daSubsloading,
  };
};
