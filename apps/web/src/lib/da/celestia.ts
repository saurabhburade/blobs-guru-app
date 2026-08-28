import { joinUrl, L2BEAT_RAW_DATA_BASE_URL } from "@/configs/env";

export const rawData = joinUrl(
  L2BEAT_RAW_DATA_BASE_URL,
  "projects/da/celestia.json",
);
