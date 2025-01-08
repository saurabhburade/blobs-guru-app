import { availClient } from "@/lib/apollo/client";
import {
  AVAIL_ACCOUNT_EXT_LIMIT_QUERY,
  AVAIL_BLOCKS_LIMIT_QUERY,
  AVAIL_DA_EXT_FILTER_LIMIT_QUERY,
} from "@/lib/apollo/queriesAvail";
import { gql, useQuery } from "@apollo/client";
const LIMIT_PER_PAGE = 10;
export const useAvailBlocks = ({ page }: { page: number }) => {
  const { data, loading } = useQuery(AVAIL_BLOCKS_LIMIT_QUERY, {
    variables: {
      skip: LIMIT_PER_PAGE * (page - 1),
      limit: LIMIT_PER_PAGE,
    },
    pollInterval: 15_000, // Every 15 sec
    client: availClient,
  });

  const blocksList = data?.blocks?.nodes?.map((b: any) => `${b?.id}`);
  const queries = blocksList?.map((blk: string, idx: number) => {
    return `
  dataSubmissions_${idx}:dataSubmissions(filter:{extrinsic:{blockHeight:{in:["${blk}"]}}}){
   aggregates{
    sum{
      byteSize
    }
       distinctCount{
      id
    }
  }
  }
    `;
  });

  const { data: res, loading: daSubsloading } = useQuery(
    gql`
    query{
    ${queries?.join(" ")}
    }
    `,
    {
      pollInterval: 15_000, // Every 15 sec
      client: availClient,
      skip: queries?.length <= 0,
    }
  );
  const mapBlockDAData = res
    ? data?.blocks?.nodes?.map((blk: any, idx: number) => {
        const da = res[`dataSubmissions_${idx}`];
        return {
          ...blk,
          ...da?.aggregates?.sum,
          distinctCount: da?.aggregates?.distinctCount,
        };
      })
    : null;

  return { data: mapBlockDAData, loading: loading || daSubsloading };
};
