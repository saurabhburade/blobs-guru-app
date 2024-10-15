import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useL2BeatSeries = ({
  duration,
  projectId,
}: {
  duration: string;
  projectId: string;
}) => {
  // https://l2beat.com/api/trpc/tvl.chart,activity.chart,costs.chart?batch=1&input=
  const d = useQuery({
    queryKey: ["useL2BeatSeries", duration, projectId],
    queryFn: async () => {
      const res = await axios.get(
        "https://l2beat.com/api/trpc/tvl.chart,activity.chart,costs.chart",
        {
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
        }
      );
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
  // https://l2beat.com/api/trpc/tvl.chart,activity.chart,costs.chart?batch=1&input=
  const d = useQuery({
    queryKey: ["useL2BeatTVLSummary", duration, projectId],
    queryFn: async () => {
      const res = await axios.get(
        `https://l2beat.com/api/scaling/tvl/${projectId}`,
        {
          params: {
            range: duration,
          },
        }
      );
      return res.data;
    },
    enabled: projectId ? true : false,
    staleTime: 60000 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return d;
};
