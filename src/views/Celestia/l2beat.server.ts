import type { CelestiaRiskDatum, CelestiaTvlDatum } from "./ChartIslands";

type RiskItem = {
  value?: string;
  sentiment?: CelestiaRiskDatum["sentiment"];
  description?: string;
};

type ProjectResponse = {
  id?: string;
  display?: {
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    purposes?: string[];
    provider?: string;
  };
  badges?: Array<{ id?: string }>;
  stage?: {
    stage?: string;
    missing?: { nextStage?: string; requirements?: string[] };
  };
  milestones?: Array<{ name?: string; date?: string; description?: string }>;
  riskView?: {
    dataAvailability?: RiskItem;
    exitWindow?: RiskItem;
    sequencerFailure?: RiskItem;
    proposerFailure?: RiskItem;
    stateValidation?: RiskItem;
  };
};

type TvlResponse = {
  success?: boolean;
  data?: {
    chart?: {
      types?: string[];
      data?: number[][];
    };
  };
};

export type CelestiaL2BeatData = {
  id: string;
  display: {
    name: string;
    slug: string;
    description: string;
    category: string;
    purposes: string[];
    provider: string;
  };
  logoUri: string;
  badges: string[];
  stage: {
    stage: string;
    missing?: { nextStage?: string; requirements?: string[] };
  };
  milestone: { name: string; date?: string; description?: string } | null;
  risks: CelestiaRiskDatum[];
  tvl: {
    chart: CelestiaTvlDatum[];
    total: number;
    change: number;
    canonical: number;
    native: number;
    external: number;
    canonicalPercent: number;
    nativePercent: number;
    externalPercent: number;
  } | null;
};

const PROJECT_BASE =
  "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/celestia/celestia";
const L2BEAT_BASE = "https://l2beat.com/api/scaling/tvs";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 1_440, tags: ["celestia:l2beat"] },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function risks(project: ProjectResponse): CelestiaRiskDatum[] {
  const riskView = project.riskView;
  const items: Array<[string, RiskItem | undefined]> = [
    ["Data Availability", riskView?.dataAvailability],
    ["Exit Window", riskView?.exitWindow],
    ["Sequencer Failure", riskView?.sequencerFailure],
    ["Proposer Failure", riskView?.proposerFailure],
    ["State Validation", riskView?.stateValidation],
  ];
  return items.map(([name, risk]) => ({
    name,
    valuePie: 1,
    value: risk?.value,
    sentiment: risk?.sentiment ?? "neutral",
    description: risk?.description,
  }));
}

function mapTvl(response: TvlResponse | null): CelestiaL2BeatData["tvl"] {
  const types = response?.data?.chart?.types;
  const rows = response?.data?.chart?.data;
  if (!types?.length || !rows?.length) return null;

  const mapped = rows.map((row) =>
    Object.fromEntries(types.map((type, index) => [type, row[index] ?? 0])),
  );
  const chart = mapped.map((point) => {
    const canonical = Number(point.canonical || 0);
    const native = Number(point.native || 0);
    const external = Number(point.external || 0);
    const total = canonical + native + external;
    return {
      timestamp: Number(point.timestamp || 0),
      tvlChart: total
        ? (canonical * canonical + native * native + external * external) /
          total
        : 0,
      nativeChart: total ? (native / total) * native : 0,
      canonicalChart: total ? (canonical / total) * canonical : 0,
      externalChart: total ? (external / total) * external : 0,
      canonical,
      native,
      external,
      canonicalPercent: total ? (canonical / total) * 100 : 0,
      nativePercent: total ? (native / total) * 100 : 0,
      externalPercent: total ? (external / total) * 100 : 0,
    };
  });
  const latest = chart.at(-1);
  const previous = chart.at(-2);
  if (!latest) return null;
  const total = latest.canonical + latest.native + latest.external;
  const previousTotal = previous
    ? previous.canonical + previous.native + previous.external
    : 0;
  return {
    chart,
    total,
    change: previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0,
    canonical: total ? (latest.canonical / total) * latest.canonical : 0,
    native: total ? (latest.native / total) * latest.native : 0,
    external: total ? (latest.external / total) * latest.external : 0,
    canonicalPercent: latest.canonicalPercent,
    nativePercent: latest.nativePercent,
    externalPercent: latest.externalPercent,
  };
}

export async function getCelestiaL2BeatData(
  appName: string,
): Promise<CelestiaL2BeatData | null> {
  const normalizedName = appName.trim().toLowerCase();
  if (!normalizedName || normalizedName === "—") return null;

  const project = await fetchJson<ProjectResponse>(
    `${PROJECT_BASE}/${encodeURIComponent(normalizedName)}.json`,
  );
  if (!project?.id || !project.display?.name) return null;

  const displayName = project.display.name;
  const tvlResponse = await fetchJson<TvlResponse>(
    `${L2BEAT_BASE}/${encodeURIComponent(project.id)}?range=30d`,
  );
  const display = project.display;
  return {
    id: project.id,
    display: {
      name: displayName,
      slug: display.slug ?? project.id,
      description: display.description ?? "",
      category: display.category ?? "—",
      purposes: display.purposes ?? [],
      provider: display.provider ?? "—",
    },
    logoUri: `https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/icons/${encodeURIComponent(display.slug ?? project.id)}.png`,
    badges: (project.badges ?? [])
      .map((badge) => badge.id)
      .filter((badge): badge is string => Boolean(badge)),
    stage: {
      stage: project.stage?.stage ?? "—",
      missing: project.stage?.missing,
    },
    milestone: project.milestones?.[0]?.name
      ? {
          name: project.milestones[0].name,
          date: project.milestones[0].date,
          description: project.milestones[0].description,
        }
      : null,
    risks: risks(project),
    tvl: mapTvl(tvlResponse),
  };
}
