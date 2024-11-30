import { getDARAW } from "@/lib/da/list";
import { useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

export const useDAProvidersRaw = () => {
  const providersRawUrls = getDARAW();
  const queries = providersRawUrls?.map<UseQueryOptions<any>>(
    (rawUrl: string) => {
      return {
        queryKey: ["useDAProvidersRaw", rawUrl],
        queryFn: async () => {
          const d = await axios.get(rawUrl);
          return d?.data;
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
      };
    }
  );
  const result = useQueries({ queries });

  return result;
};
