const OTHER_SERIES_ID = "Other";

export function getAppSeriesId(appParticipantId: unknown) {
  if (typeof appParticipantId !== "string") {
    return "";
  }

  if (appParticipantId.toLowerCase() === OTHER_SERIES_ID.toLowerCase()) {
    return OTHER_SERIES_ID;
  }

  return appParticipantId.toLowerCase().split("-")[0];
}

export function getAppSeriesColor(seriesId: string) {
  if (seriesId === OTHER_SERIES_ID) {
    return "#4318f5";
  }

  let hash = 0;
  for (let index = 0; index < seriesId.length; index++) {
    hash = (hash * 31 + seriesId.charCodeAt(index)) >>> 0;
  }

  const hue = Math.round((hash * 0.618033988749895 * 360) % 360);
  const saturation = 68 + (hash % 18);
  const lightness = 48 + ((hash >>> 8) % 14);

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
