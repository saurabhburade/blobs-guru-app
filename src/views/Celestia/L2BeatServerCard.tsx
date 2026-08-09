import { Info, Shield, X } from "lucide-react";
import { CelestiaRiskPieChart, CelestiaTvlChart } from "./ChartIslands";
import type { CelestiaL2BeatData } from "./l2beat.server";

function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function stageName(stage: string) {
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

const riskColors = {
  good: "#4CAF50",
  bad: "#F44336",
  warning: "#FF9800",
  neutral: "gray",
} as const;

export default function L2BeatServerCard({
  project,
}: {
  project: CelestiaL2BeatData;
}) {
  const stageDescription = stageName(project.stage.stage);
  return (
    <div className="rounded-lg border border-base-300/30 bg-base-100/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 p-4">
        <div className="flex items-center gap-2">
          <img
            src={project.logoUri}
            className="rounded-lg"
            width="40"
            height="40"
            alt=""
          />
          <div>
            <p className="text-xl">{project.display.name}</p>
            <p className="text-xs">Source L2BEAT</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {project.badges.map((badge) => (
            <img
              key={badge}
              src={`https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/images/badges/${encodeURIComponent(badge)}.png`}
              alt=""
              className="h-[30px] w-[30px] lg:h-[50px] lg:w-[50px]"
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="h-full border-base-200/50 bg-base-100 pb-4 lg:border-r">
          <p className="p-4 pb-0">{project.display.description}</p>
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
            <div className="h-full space-y-4 rounded-xl bg-base-200/30 p-4">
              <p>Stage</p>
              <div className="flex items-center justify-between">
                <p className="overflow-hidden break-words text-xl font-bold">
                  {project.stage.stage}
                </p>
                {stageDescription ? (
                  <details className="dropdown dropdown-end">
                    <summary className="cursor-pointer list-none text-primary">
                      <Info width={24} height={24} />
                    </summary>
                    <div className="dropdown-content z-10 w-[20em] space-y-2 rounded-lg border border-base-200 bg-base-100 text-current shadow">
                      <p className="p-4 pb-0">
                        {project.stage.stage} — {stageDescription}
                      </p>
                      <hr className="border-base-200" />
                      <div className="space-y-2 p-4 pt-0">
                        {project.stage.missing?.nextStage ? (
                          <p>
                            Items missing for {project.stage.missing.nextStage}
                          </p>
                        ) : null}
                        {project.stage.missing?.requirements?.map(
                          (requirement) => (
                            <div
                              className="flex items-center gap-4"
                              key={requirement}
                            >
                              <X className="text-warning" />
                              <p className="text-xs">{requirement}</p>
                            </div>
                          ),
                        )}
                        <div className="flex items-center gap-4 rounded-lg bg-base-200/50 p-4">
                          <Info className="text-primary" />
                          <p className="text-xs">
                            Please mind, stages do not reflect rollup security
                          </p>
                        </div>
                      </div>
                    </div>
                  </details>
                ) : null}
              </div>
            </div>
            <InfoTile title="Type" value={project.display.category} />
            <InfoTile
              title="Purpose"
              value={project.display.purposes[0] ?? "—"}
            />
            <InfoTile title="Provider" value={project.display.provider} />
          </div>

          {project.milestone ? (
            <div className="mx-4 space-y-2 rounded-xl bg-base-200/30 p-4">
              <div className="flex justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield width={30} height={30} />
                  <p className="font-medium">{project.milestone.name}</p>
                </div>
                {project.milestone.date ? (
                  <p className="text-sm">
                    {new Date(project.milestone.date).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <hr className="border-base-200" />
              <p className="text-xs">{project.milestone.description}</p>
            </div>
          ) : null}
        </div>

        <div className="hidden h-full min-h-[20em] w-full items-center justify-center lg:flex">
          <CelestiaRiskPieChart data={project.risks} />
        </div>
        <div className="flex flex-col justify-between gap-2 p-4 lg:hidden">
          {project.risks.map((risk) => (
            <details
              className="collapse collapse-arrow h-fit bg-base-100"
              key={risk.name}
            >
              <summary className="collapse-title text-md font-medium">
                <span className="flex items-center justify-between gap-2">
                  <span>
                    {risk.name} — {risk.value}
                  </span>
                  <span className="flex items-center gap-2 px-4 text-[10px]">
                    <span
                      className="h-[1em] w-[1em] rounded-full"
                      style={{
                        backgroundColor:
                          riskColors[risk.sentiment ?? "neutral"],
                      }}
                    />
                    <span className="capitalize">{risk.sentiment}</span>
                  </span>
                </span>
              </summary>
              <div className="collapse-content">
                <p className="text-sm">{risk.description}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {project.tvl ? <TvlPanel tvl={project.tvl} /> : null}
    </div>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="h-full space-y-4 rounded-xl bg-base-200/30 p-4">
      <p>{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function TvlPanel({ tvl }: { tvl: NonNullable<CelestiaL2BeatData["tvl"]> }) {
  return (
    <div className="grid bg-base-100 lg:h-[15em] lg:grid-cols-2">
      <div className="border-base-200/50 p-4 lg:border-r">
        <p className="p-2 text-2xl font-bold">
          TVL $ {compact(tvl.total)}{" "}
          <span
            className={`text-sm ${tvl.change > 0 ? "text-green-500" : tvl.change < 0 ? "text-error" : ""}`}
          >
            {tvl.change.toFixed(2)} %
          </span>
        </p>
        <div className="grid gap-4 py-5 lg:grid-cols-3">
          <TvlMetric
            title="Canonical"
            color="bg-purple-700"
            value={tvl.canonical}
            percent={tvl.canonicalPercent}
          />
          <TvlMetric
            title="Native"
            color="bg-pink-600"
            value={tvl.native}
            percent={tvl.nativePercent}
          />
          <TvlMetric
            title="External"
            color="bg-yellow-500"
            value={tvl.external}
            percent={tvl.externalPercent}
          />
        </div>
      </div>
      <div className="min-h-[15em] px-10 py-5">
        <CelestiaTvlChart data={tvl.chart} />
      </div>
    </div>
  );
}

function TvlMetric({
  title,
  color,
  value,
  percent,
}: {
  title: string;
  color: string;
  value: number;
  percent: number;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-base-200/30 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-5 w-5 rounded-lg border border-base-300 ${color}`}
        />
        <p>{title}</p>
      </div>
      <p className="text-lg font-bold opacity-70">
        $ {compact(value)}{" "}
        <span className="text-xs opacity-55">{percent.toFixed(2)} %</span>
      </p>
    </div>
  );
}
