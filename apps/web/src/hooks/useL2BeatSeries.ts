import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  joinUrl,
  L2BEAT_TRPC_URL,
  L2BEAT_TVS_API_BASE_URL,
} from "@/configs/env";

export const useL2BeatSeries = ({
  duration,
  projectId,
}: {
  duration: string;
  projectId: string;
}) => {
  const d = useQuery({
    queryKey: ["useL2BeatSeries", duration, projectId],
    queryFn: async () => {
      const res = await axios.get(L2BEAT_TRPC_URL, {
        params: {
          batch: 1,
          input: JSON.stringify({
            "0": {
              json: {
                filter: { type: "projects", projectIds: [projectId] },
                range: "30d",
                excludeAssociatedTokens: false,
              },
            },
            "1": {
              json: {
                range: "30d",
                filter: { type: "projects", projectIds: [projectId] },
              },
            },
            "2": {
              json: {
                range: "30d",
                filter: { type: "projects", projectIds: [projectId] },
              },
            },
          }),
        },
      });
      return res.data;
    },
    enabled: projectId ? true : false,
  });
  return d;
};
export const useL2BeatTVLSummary = ({
  duration,
  projectId,
}: {
  duration: string;
  projectId: string;
}) => {
  const d = useQuery({
    queryKey: ["useL2BeatTVLSummary", duration, projectId],
    queryFn: async () => {
      const res = await axios.get(joinUrl(L2BEAT_TVS_API_BASE_URL, projectId), {
        params: {
          range: duration,
        },
      });
      return res.data;
    },
    enabled: projectId ? true : false,
    staleTime: 60000 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return d;
};
