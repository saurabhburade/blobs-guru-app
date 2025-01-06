import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_ACCOUNT_EXT_LIMIT_QUERY,
  AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesAvail";
import { useQuery } from "@apollo/client";
const LIMIT_PER_PAGE = 10;
export const useAvailAccountExt = ({
  account,
  page,
}: {
  account: string;
  page: number;
}) => {
  const { data, loading } = useQuery(AVAIL_ACCOUNT_EXT_LIMIT_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
      address: account,
    },
    pollInterval: 15_000, // Every 15 sec
    client: availClient,
  });
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
