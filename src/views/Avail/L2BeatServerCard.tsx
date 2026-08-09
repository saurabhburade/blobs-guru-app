import type {
  AvailL2BeatAppData,
  AvailL2BeatTvlSummary,
  DaNode,
} from "@/lib/da/server";
import { Info, Shield } from "lucide-react";
import { AvailRiskPieChart, AvailTvlChart } from "./ChartIslands";

type RiskSentiment = "good" | "bad" | "warning" | "neutral";

type RiskDatum = {
  name: string;
  value: string;
  valuePie: number;
  sentiment: RiskSentiment;
  description: string;
};

function object(value: unknown): DaNode {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DaNode)
    : {};
}

function text(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function risk(project: DaNode, key: string, name: string): RiskDatum {
  const item = object(object(project.riskView)[key]);
  const rawSentiment = text(item.sentiment, "neutral");
  const sentiment: RiskSentiment = ["good", "bad", "warning"].includes(
    rawSentiment,
  )
    ? (rawSentiment as RiskSentiment)
    : "neutral";
  return {
    name,
    value: text(item.value),
    valuePie: 1,
    sentiment,
    description: text(item.description, "No description available."),
  };
}

function risks(project: DaNode): RiskDatum[] {
  return [
    risk(project, "dataAvailability", "Data Availability"),
    risk(project, "exitWindow", "Exit Window"),
    risk(project, "sequencerFailure", "Sequencer Failure"),
    risk(project, "proposerFailure", "Proposer Failure"),
    risk(project, "stateValidation", "State Validation"),
  ];
}

function stageDescription(stage: string): string | undefined {
  switch (stage) {
    case "UnderReview":
      return "Stage under review";
    case "Stage 0":
      return "Full training wheels";
    case "Stage 1":
      return "Limited training wheels";
    case "Stage 2":
      return "No training wheels";
    default:
      return undefined;
  }
}

export default function AvailL2BeatServerCard({
  data,
  logoOverride,
}: {
  data: AvailL2BeatAppData | null;
  logoOverride?: string;
}) {
  if (!data) return null;
  const { project } = data;
  const display = object(project.display);
  const stage = object(project.stage);
  const stageName = text(stage.stage);
  const purposes = list(display.purposes).map(String);
  const badges = list(project.badges).map(object);
  const milestone = object(list(project.milestones)[0]);
  const projectRisks = risks(project);
  const slug = text(display.slug, "");
  const logo =
    logoOverride ||
    (slug
      ? `https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/icons/${encodeURIComponent(slug.toLowerCase())}.png`
      : "/images/logox.jpeg");
  return (
    <div className="rounded-lg border border-base-300/30 bg-base-100/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 p-4">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            className="rounded-lg"
            width="40"
            height="40"
            alt=""
          />
          <div>
            <p className="text-xl">{text(display.name)}</p>
            <p className="text-xs">Source L2BEAT</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge) => {
            const id = text(badge.id, "");
            return id ? (
              <img
                key={id}
                src={`https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/images/badges/${encodeURIComponent(id)}.png`}
                alt={text(badge.name, id)}
                className="h-[30px] w-[30px] lg:h-[50px] lg:w-[50px]"
              />
            ) : null;
          })}
        </div>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="h-full border-r border-base-200/50 bg-base-100 pb-4">
          <p className="p-4 pb-0">{text(display.description)}</p>
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
            <ProjectMetric label="Stage">
              <span className="flex items-center gap-2">
                {stageName}
                {stageDescription(stageName) ? (
                  <Info
                    width="20"
                    height="20"
                    className="text-primary"
                    aria-label={stageDescription(stageName)}
                  />
                ) : null}
              </span>
            </ProjectMetric>
            <ProjectMetric label="Type">{text(display.category)}</ProjectMetric>
            <ProjectMetric label="Purpose">{purposes[0] ?? "—"}</ProjectMetric>
            <ProjectMetric label="Provider">
              {text(display.provider)}
            </ProjectMetric>
          </div>
          {text(milestone.name, text(milestone.title, "")) ? (
            <div className="mx-4 space-y-2 rounded-xl bg-base-200/30 p-4">
              <div className="flex justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield width="30" height="30" />
                  <p className="font-medium">
                    {text(milestone.name, text(milestone.title))}
                  </p>
                </div>
                <p className="text-sm">
                  {new Date(String(milestone.date ?? "")).toLocaleDateString()}
                </p>
              </div>
              <hr className="border-base-200" />
              <p className="text-xs">{text(milestone.description)}</p>
            </div>
          ) : null}
        </div>
        <div className="hidden h-full min-h-[20em] w-full items-center justify-center bg-red-50 lg:flex">
          <AvailRiskPieChart data={projectRisks} />
        </div>
        <div className="flex flex-col justify-between gap-2 p-4 lg:hidden">
          {projectRisks.map((item) => (
            <details
              className="collapse collapse-arrow h-fit bg-base-100"
              key={item.name}
            >
              <summary className="collapse-title text-base font-medium">
                <span className="flex items-center justify-between gap-2">
                  <span>
                    {item.name} ---- {item.value}
                  </span>
                  <RiskDot sentiment={item.sentiment} />
                </span>
              </summary>
              <p className="collapse-content text-sm">{item.description}</p>
            </details>
          ))}
        </div>
      </div>
      {data.tvlSummary && data.tvlPoints.length ? (
        <TvlPanel summary={data.tvlSummary} points={data.tvlPoints} />
      ) : null}
    </div>
  );
}

function ProjectMetric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full space-y-4 rounded-xl bg-base-200/30 p-4">
      <p>{label}</p>
      <div className="overflow-hidden break-words text-xl font-bold">
        {children}
      </div>
    </div>
  );
}

function RiskDot({ sentiment }: { sentiment: RiskSentiment }) {
  const colors: Record<RiskSentiment, string> = {
    good: "#4CAF50",
    bad: "#F44336",
    warning: "#FF9800",
    neutral: "gray",
  };
  return (
    <span className="flex items-center gap-2 text-[10px] capitalize">
      <span
        className="h-[1em] w-[1em] rounded-full"
        style={{ backgroundColor: colors[sentiment] }}
      />
      {sentiment}
    </span>
  );
}

function TvlPanel({
  summary,
  points,
}: {
  summary: AvailL2BeatTvlSummary;
  points: AvailL2BeatAppData["tvlPoints"];
}) {
  return (
    <div className="grid bg-base-100 lg:h-[15em] lg:grid-cols-2">
      <div className="border-r border-base-200/50 p-4">
        <p className="my-2 p-2 text-2xl font-bold">
          TVL $ {compact(summary.tvl)}{" "}
          <span
            className={`text-sm ${summary.tvlChange > 0 ? "text-green-500" : summary.tvlChange < 0 ? "text-error" : ""}`}
          >
            {summary.tvlChange.toFixed(2)} %
          </span>
        </p>
        <div className="grid gap-4 py-5 lg:grid-cols-3">
          <TvlMetric
            label="Canonical"
            color="#7e22ce"
            value={summary.canonical}
            percent={summary.canonicalPercent}
          />
          <TvlMetric
            label="Native"
            color="#be185d"
            value={summary.native}
            percent={summary.nativePercent}
          />
          <TvlMetric
            label="External"
            color="#eab308"
            value={summary.external}
            percent={summary.externalPercent}
          />
        </div>
      </div>
      <div className="min-h-[15em] px-10 py-5">
        <AvailTvlChart data={points} />
      </div>
    </div>
  );
}

function TvlMetric({
  label,
  color,
  value,
  percent,
}: {
  label: string;
  color: string;
  value: number;
  percent: number;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-base-200/30 p-4">
      <div className="flex items-center gap-2">
        <span
          className="h-5 w-5 rounded-lg border border-base-300"
          style={{ backgroundColor: color }}
        />
        <p>{label}</p>
      </div>
      <p className="text-lg font-bold opacity-70">
        $ {compact(value)}{" "}
        <span className="text-xs opacity-55">{percent.toFixed(2)} %</span>
      </p>
    </div>
  );
}

function compact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
