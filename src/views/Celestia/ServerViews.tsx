import {
  getAccounts,
  getActivity,
  getApps,
  getDetail,
  getDetailHistory,
  getSearch,
  getStats,
  getSummary,
} from "@/lib/da/server";
import {
  AppCards,
  ActivityTable,
  ChainShell,
  DataTable,
  DetailCard,
  MetricGrid,
  SearchResults,
  bytes,
  value,
} from "@/views/DaServerView";
import {
  CelestiaEntityStatsCharts,
  CelestiaStatsCharts,
  CelestiaSummaryCharts,
  CelestiaUtilisationChart,
} from "./ChartIslands";
import L2BeatServerCard from "./L2BeatServerCard";
import { getCelestiaL2BeatData } from "./l2beat.server";

type Query = { q?: string };

export async function CelestiaSummaryView({
  blocksPage = 1,
}: {
  blocksPage?: number;
} = {}) {
  const data = await getSummary("celestia", blocksPage);
  const summary = data.summary;
  return (
    <ChainShell chain="celestia" title="Celestia DA" description>
      <CelestiaSummaryCharts days={data.days} prices={data.prices} />
      <AppCards chain="celestia" apps={data.apps} />
      <MetricGrid
        metrics={[
          ["Last block", value(summary, "endBlock")],
          ["Txn Fees", value(summary, "totalFeesNative"), "TIA"],
          ["Total data", bytes(value(summary, "totalByteSize"))],
          ["Total Txns", value(summary, "totalTxnCount")],
          ["DA Submissions", value(summary, "totalDataSubmissionCount")],
          ["Total DA Fees", value(summary, "totalDAFees")],
          [
            "Total DA Fees [usd]",
            value(summary, "totalDAFeesUSD"),
            undefined,
            "$",
          ],
          ["Last TIA Price", value(summary, "avgNativePrice")],
        ]}
      />
      <section>
        <h2 className="mb-3 text-xl font-semibold">Recent blocks</h2>
        <DataTable
          chain="celestia"
          rows={data.blocks}
          kind="blocks"
          pagination={{
            page: data.blocksPage,
            pageSize: data.blocksPageSize,
            totalCount: data.blocksTotalCount,
            basePath: "/celestia",
            paramName: "blocksPage",
          }}
        />
      </section>
    </ChainShell>
  );
}

export async function CelestiaAppsView({ page = 1 }: { page?: number } = {}) {
  const apps = await getApps("celestia", page);
  return (
    <ChainShell chain="celestia" title="Celestia DA">
      <DataTable
        chain="celestia"
        rows={apps.rows}
        kind="apps"
        pagination={{
          page: apps.page,
          pageSize: apps.pageSize,
          totalCount: apps.totalCount,
          basePath: "/celestia/apps",
        }}
      />
    </ChainShell>
  );
}
export async function CelestiaAccountsView({ page = 1 }: { page?: number } = {}) {
  const accounts = await getAccounts("celestia", page);
  return (
    <ChainShell chain="celestia" title="Celestia Accounts">
      <DataTable
        chain="celestia"
        rows={accounts.rows}
        kind="accounts"
        pagination={{
          page: accounts.page,
          pageSize: accounts.pageSize,
          totalCount: accounts.totalCount,
          basePath: "/celestia/accounts",
        }}
      />
    </ChainShell>
  );
}
export async function CelestiaSearchView({ query }: { query?: Query }) {
  const results = await getSearch("celestia", query?.q ?? "");
  return (
    <ChainShell chain="celestia" title="Search results">
      <SearchResults chain="celestia" results={results} />
    </ChainShell>
  );
}
export async function CelestiaStatsView({
  duration = 15,
}: {
  duration?: number;
}) {
  const data = await getStats("celestia", 90);
  return (
    <ChainShell chain="celestia" title="Celestia Stats">
      <CelestiaUtilisationChart blocks={data.blocks} />
      <CelestiaStatsCharts days={data.days} duration={duration} />
    </ChainShell>
  );
}

export async function CelestiaAccountView({
  id,
  txnPage = 1,
}: {
  id: string;
  txnPage?: number;
}) {
  const [detail, history, activity] = await Promise.all([
    getDetail("celestia", "account", id),
    getDetailHistory("celestia", "account", id),
    getActivity("celestia", "account", id, txnPage),
  ]);
  return (
    <ChainShell chain="celestia" title="Celestia account" search={false}>
      <DetailCard chain="celestia" title="Celestia account" data={detail} />
      <CelestiaEntityStatsCharts days={history.days} kind="account" />
      <ActivityTable
        chain="celestia"
        rows={activity.rows}
        pagination={{
          page: activity.page,
          pageSize: activity.pageSize,
          totalCount: activity.totalCount,
          basePath: `/celestia/${encodeURIComponent(id)}`,
          paramName: "txnPage",
        }}
      />
    </ChainShell>
  );
}
export async function CelestiaAppView({
  id,
  txnPage = 1,
}: {
  id: string;
  txnPage?: number;
}) {
  const detail = await getDetail("celestia", "app", id);
  const [history, l2Beat, activity] = await Promise.all([
    getDetailHistory("celestia", "app", id),
    getCelestiaL2BeatData(String(detail?.name ?? "")),
    getActivity("celestia", "app", id, txnPage),
  ]);
  return (
    <ChainShell chain="celestia" title="Celestia app" search={false}>
      {l2Beat ? <L2BeatServerCard project={l2Beat} /> : null}
      <DetailCard chain="celestia" title="Celestia app" data={detail} />
      <CelestiaEntityStatsCharts days={history.days} kind="app" />
      <ActivityTable
        chain="celestia"
        rows={activity.rows}
        pagination={{
          page: activity.page,
          pageSize: activity.pageSize,
          totalCount: activity.totalCount,
          basePath: `/celestia/apps/${encodeURIComponent(id)}`,
          paramName: "txnPage",
        }}
      />
    </ChainShell>
  );
}

export async function CelestiaBlockView({ id }: { id: string }) {
  return (
    <ChainShell chain="celestia" title="Celestia block" search={false}>
      <DetailCard
        chain="celestia"
        title="Celestia block"
        data={await getDetail("celestia", "block", id)}
      />
    </ChainShell>
  );
}
export async function CelestiaTxnView({ id }: { id: string }) {
  return (
    <ChainShell chain="celestia" title="Celestia transaction" search={false}>
      <DetailCard
        chain="celestia"
        title="Celestia transaction"
        data={await getDetail("celestia", "txn", id)}
      />
    </ChainShell>
  );
}
