import {
  getAccounts,
  getActivity,
  getApps,
  getAvailL2BeatApp,
  getDetail,
  getDetailHistory,
  getSearch,
  getStats,
  getSummary,
} from "@/lib/da/server";
import {
  AppCards,
  ActivityTable,
  ChainDescription,
  ChainShell,
  DataTable,
  DetailCard,
  MetricGrid,
  SearchResults,
  bytes,
  fixed,
  formatDate,
  numeric,
  short,
  timeAgo,
  value,
} from "@/views/DaServerView";
import {
  AvailAccountBalanceChart,
  AvailAccountStatsCharts,
  AvailAppStatsCharts,
  AvailStatsCharts,
  AvailSummaryPriceChart,
  AvailSummarySizeChart,
  AvailUtilisationChart,
} from "./ChartIslands";
import AvailL2BeatServerCard from "./L2BeatServerCard";
import type { DaNode } from "@/lib/da/server";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Database,
  HardDriveUpload,
  NotepadText,
  User,
} from "lucide-react";
import Link from "next/link";
import { formatAddress } from "@/lib/utils";
import BigNumber from "bignumber.js";
import type { ReactNode } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";

type Query = { q?: string };

export async function AvailSummaryView({
  blocksPage = 1,
}: {
  blocksPage?: number;
} = {}) {
  const data = await getSummary("avail", blocksPage);
  const summary = data.summary;
  return (
    <ChainShell chain="avail" title="Avail DA">
      <ChainDescription chain="avail" />
      <div className="grid gap-4 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
          <AvailSummarySizeChart days={data.days} />
        </div>
        <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
          <AvailSummaryPriceChart days={data.prices} />
        </div>
      </div>
      <AppCards chain="avail" apps={data.apps} />
      <MetricGrid
        metrics={[
          ["Last block", value(summary, "endBlock")],
          ["Txn Fees", value(summary, "totalFees"), "AVAIL"],
          ["Total data", bytes(value(summary, "totalByteSize"))],
          ["Total ext", value(summary, "totalExtrinsicCount")],
          ["DA Submissions", value(summary, "totalDataSubmissionCount")],
          ["Total DA Fees", value(summary, "totalDAFees")],
          [
            "Total DA Fees [usd]",
            value(summary, "totalDAFeesUSD"),
            undefined,
            "$",
          ],
          ["Last Avail Price", value(summary, "avgAvailPrice")],
        ]}
      />
      <section>
        <h2 className="mb-3 text-xl font-semibold">Recent blocks</h2>
        <DataTable
          chain="avail"
          rows={data.blocks}
          kind="blocks"
          pagination={{
            page: data.blocksPage,
            pageSize: data.blocksPageSize,
            totalCount: data.blocksTotalCount,
            basePath: "/avail",
            paramName: "blocksPage",
          }}
        />
      </section>
    </ChainShell>
  );
}
export async function AvailAppsView({ page = 1 }: { page?: number } = {}) {
  const apps = await getApps("avail", page);
  return (
    <ChainShell chain="avail" title="Avail DA">
      <DataTable
        chain="avail"
        rows={apps.rows}
        kind="apps"
        pagination={{
          page: apps.page,
          pageSize: apps.pageSize,
          totalCount: apps.totalCount,
          basePath: "/avail/apps",
        }}
      />
    </ChainShell>
  );
}
export async function AvailAccountsView({ page = 1 }: { page?: number } = {}) {
  const accounts = await getAccounts("avail", page);
  return (
    <ChainShell chain="avail" title="Avail Accounts">
      <DataTable
        chain="avail"
        rows={accounts.rows}
        kind="accounts"
        pagination={{
          page: accounts.page,
          pageSize: accounts.pageSize,
          totalCount: accounts.totalCount,
          basePath: "/avail/accounts",
        }}
      />
    </ChainShell>
  );
}
export async function AvailSearchView({ query }: { query?: Query }) {
  const results = await getSearch("avail", query?.q ?? "");
  return (
    <ChainShell chain="avail" title="Search results">
      <SearchResults chain="avail" results={results} />
    </ChainShell>
  );
}
export async function AvailStatsView({ duration = 15 }: { duration?: number }) {
  const data = await getStats("avail", 90);
  const utilization = data.utilization as any;
  return (
    <ChainShell chain="avail" title="Avail Stats">
      <AvailUtilisationChart
        lastBlock={String(data.blocks[0]?.id ?? 0)}
        blockCount={data.blocks.length}
        totalByteSize={Number(utilization?.aggregates?.sum?.byteSize ?? 0)}
        totalSubmissionCount={Number(utilization?.totalCount ?? 0)}
      />
      <AvailStatsCharts
        days={data.days}
        extrinsicDays={data.days}
        duration={duration}
      />
    </ChainShell>
  );
}
export async function AvailAccountView({
  id,
  txnPage = 1,
}: {
  id: string;
  txnPage?: number;
}) {
  const [detail, history, activity] = await Promise.all([
    getDetail("avail", "account", id),
    getDetailHistory("avail", "account", id),
    getActivity("avail", "account", id, txnPage),
  ]);
  return (
    <ChainShell
      chain="avail"
      title="Avail Account"
      search={false}
      compactHeader
    >
      <AvailAccountDetailCard
        account={id}
        detail={detail}
        balances={history.balances.slice(0, 15)}
      />
      <AvailAccountStatsCharts days={history.days} />
      <ActivityTable
        chain="avail"
        rows={activity.rows}
        pagination={{
          page: activity.page,
          pageSize: activity.pageSize,
          totalCount: activity.totalCount,
          basePath: `/avail/${encodeURIComponent(id)}`,
          paramName: "txnPage",
        }}
      />
    </ChainShell>
  );
}

function AvailAccountDetailCard({
  account,
  detail,
  balances,
}: {
  account: string;
  detail: DaNode | null;
  balances: DaNode[];
}) {
  if (!detail) {
    return (
      <div className="rounded-lg border border-base-200 bg-base-100 p-8 text-center">
        No avail account data is available.
      </div>
    );
  }
  const address = String(detail.id ?? account);
  const accountDetails = getAccountDetailsFromAddressBook(
    address.toLowerCase(),
  );
  return (
    <div className="rounded-lg border border-base-300/30 bg-base-100/80">
      <div className="flex h-[4em] items-center gap-2 border-b border-base-200/50 p-4">
        <User
          width={40}
          height={40}
          className="rounded-lg bg-base-200 p-2"
        />
        <Link href={`/avail/${encodeURIComponent(address)}`}>
          {accountDetails?.name ? (
            <p>{accountDetails.name}</p>
          ) : (
            <>
              <p className="hidden lg:block">{address}</p>
              <p className="block lg:hidden">{formatAddress(address)}</p>
            </>
          )}
        </Link>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="border-x-base-200/50 lg:border-r">
          <AvailAccountMetric
            icon={<NotepadText />}
            label="Extrinsic Count"
            value={new BigNumber(
              Number(detail.totalExtrinsicCount ?? 0),
            ).toFormat()}
          />
          <AvailAccountMetric
            icon={<Database />}
            label="DA size"
            value={bytes(detail.totalByteSize ?? 0)}
          />
          <AvailAccountMetric
            icon={<HardDriveUpload />}
            label="Total DA subs"
            value={new BigNumber(
              Number(detail.totalDataSubmissionCount ?? 0),
            ).toFormat()}
          />
          <AvailAccountMetric
            icon={
              <ImageWithFallback
                src="https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/avail.png?raw=true"
                fallback="/images/avail_logo.png"
                width={24}
                height={24}
                alt="avail"
              />
            }
            label="DA Fees"
            value={`${new BigNumber(Number(detail.totalDAFees ?? 0)).toFormat(4)} AVAIL`}
          />
        </div>
        <div className="w-full border-base-300/20 bg-base-100/50 p-5">
          <AvailAccountBalanceChart days={balances} />
        </div>
      </div>
    </div>
  );
}

function AvailAccountMetric({
  icon,
  label,
  value: metricValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <p>{label}</p>
      </div>
      <p className="text-xl font-bold">{metricValue}</p>
    </div>
  );
}
export async function AvailAppView({ id }: { id: string }) {
  const [detail, history, l2beat] = await Promise.all([
    getDetail("avail", "app", id),
    getDetailHistory("avail", "app", id),
    getAvailL2BeatApp(id),
  ]);
  return (
    <ChainShell chain="avail" title="Avail app" search={false}>
      <AvailL2BeatServerCard data={l2beat} />
      <DetailCard chain="avail" title="Avail app" data={detail} />
      <AvailAppStatsCharts days={history.days} />
    </ChainShell>
  );
}
export async function AvailBlockView({ id }: { id: string }) {
  const block = await getDetail("avail", "block", id);
  return (
    <ChainShell
      chain="avail"
      title="Avail Block"
      search={false}
      compactHeader
    >
      <AvailBlockDetail id={id} block={block} />
    </ChainShell>
  );
}
export async function AvailTxnView({ id }: { id: string }) {
  const transaction = await getDetail("avail", "txn", id.toLowerCase());
  return (
    <ChainShell
      chain="avail"
      title="Avail Txn"
      search={false}
      compactHeader
    >
      <AvailTxnDetail id={id} transaction={transaction} />
    </ChainShell>
  );
}

function AvailTxnDetail({
  id,
  transaction,
}: {
  id: string;
  transaction: DaNode | null;
}) {
  if (!transaction) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 p-4">
        <p>#{formatAddress(id)} is not synced yet.</p>
      </div>
    );
  }
  const submissions = transaction.dataSubmissions as DaNode | undefined;
  const aggregate = submissionSummary(transaction);
  const fees = new BigNumber(String(transaction.fees ?? 0));
  const availPrice = new BigNumber(String(transaction.availPrice ?? 0));
  const argsName = Array.isArray(transaction.argsName)
    ? transaction.argsName
    : [];
  const argsValue = Array.isArray(transaction.argsValue)
    ? transaction.argsValue
    : [];
  const timestamp = utcDate(transaction.timestamp);
  return (
    <div className="w-full lg:gap-4">
      <div className="w-full rounded-lg border border-base-200 bg-base-100/70">
        <div className="flex w-full flex-wrap items-center justify-between border-b border-base-200 p-5 lg:flex-nowrap">
          <div className="flex min-w-0 items-center gap-4">
            <NotepadText className="shrink-0" />
            <AvailResponsiveValue value={id} />
          </div>
          <p className="shrink-0">
            {timeAgo(timestamp.toISOString())}
          </p>
        </div>

        <AvailTxnRow label="Txn Hash">
          <AvailResponsiveValue value={String(transaction.id ?? id)} />
        </AvailTxnRow>
        <AvailTxnRow label="Signer">
          <AvailResponsiveValue
            value={String(transaction.signer ?? "")}
            href={`/avail/${encodeURIComponent(String(transaction.signer ?? ""))}`}
          />
        </AvailTxnRow>
        <AvailTxnRow label="Timestamp" bordered>
          {Number.isNaN(timestamp.getTime()) ? "—" : timestamp.toLocaleString()}
        </AvailTxnRow>
        <AvailTxnRow label="Module">{String(transaction.module ?? "—")}</AvailTxnRow>
        <AvailTxnRow label="Call">{String(transaction.call ?? "—")}</AvailTxnRow>

        <div className="border-b border-base-200 bg-base-200/50">
          <p className="p-5">Input</p>
          {argsName.map((arg, index) => (
            <code
              className="grid w-full grid-cols-[1.5fr_2.5fr] gap-4 p-5 lg:grid-cols-[0.75fr_3fr] lg:gap-0"
              key={`${String(arg)}-${index}`}
            >
              <p className="break-words">{String(arg)}</p>
              <p className="overflow-hidden break-words">
                {String(argsValue[index] ?? "")}
              </p>
            </code>
          ))}
        </div>

        <AvailTxnRow label="DA Count">
          {numeric(submissions?.totalCount)}
        </AvailTxnRow>
        <AvailTxnRow label="Events Count" bordered>
          {numeric(transaction.nbEvents)}
        </AvailTxnRow>
        <AvailTxnRow label="Ext Fee">{fees.toString()} AVAIL</AvailTxnRow>
        <AvailTxnRow label="Ext Fee USD">
          {fees.times(availPrice).toString()} USD
        </AvailTxnRow>
        <AvailTxnRow label="DA Fee">
          {String(aggregate.fees ?? 0)} AVAIL
        </AvailTxnRow>
        <AvailTxnRow label="DA Fee USD">
          {String(aggregate.feesUSD ?? 0)} USD
        </AvailTxnRow>
        <AvailTxnRow label="AVAIL Price">
          {availPrice.toString()}USD
        </AvailTxnRow>
        <AvailTxnRow label="Data Size">
          {bytes(aggregate.byteSize ?? 0)}
        </AvailTxnRow>
      </div>
    </div>
  );
}

function AvailTxnRow({
  label,
  children,
  bordered = false,
}: {
  label: string;
  children: ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={`grid w-full grid-cols-[1.5fr_2.5fr] gap-4 p-5 lg:grid-cols-[0.75fr_3fr] lg:gap-0 ${bordered ? "border-b border-base-200" : ""}`}
    >
      <div>{label}</div>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

function AvailResponsiveValue({
  value,
  href,
}: {
  value: string;
  href?: string;
}) {
  const desktopClass = `hidden min-w-0 break-words lg:block ${href ? "text-primary" : ""}`;
  const mobileClass = `block min-w-0 break-words lg:hidden ${href ? "text-primary" : ""}`;
  if (href) {
    return (
      <>
        <Link className={desktopClass} href={href}>{value || "—"}</Link>
        <Link className={mobileClass} href={href}>
          {value ? formatAddress(value) : "—"}
        </Link>
      </>
    );
  }
  return (
    <>
      <span className={desktopClass}>{value || "—"}</span>
      <span className={mobileClass}>
        {value ? formatAddress(value) : "—"}
      </span>
    </>
  );
}

function nestedNodes(node: DaNode | null, key: string): DaNode[] {
  const connection = node?.[key];
  if (!connection || typeof connection !== "object") return [];
  const rows = (connection as DaNode).nodes;
  return Array.isArray(rows) ? (rows as DaNode[]) : [];
}

function submissionSummary(extrinsic: DaNode): DaNode {
  const submissions = extrinsic.dataSubmissions;
  if (!submissions || typeof submissions !== "object") return {};
  const aggregates = (submissions as DaNode).aggregates;
  if (!aggregates || typeof aggregates !== "object") return {};
  const sum = (aggregates as DaNode).sum;
  return sum && typeof sum === "object" ? (sum as DaNode) : {};
}

function utcDate(item: unknown): Date {
  const text = String(item ?? "");
  const normalized = /(?:z|[+-]\d{2}:?\d{2})$/i.test(text)
    ? text
    : `${text}Z`;
  return new Date(normalized);
}

function AvailBlockDetail({
  id,
  block,
}: {
  id: string;
  block: DaNode | null;
}) {
  if (!block) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 p-4">
        <p>#{id} Block is not synced yet.</p>
      </div>
    );
  }
  const extrinsics = nestedNodes(block, "extrinsics");
  const totals = extrinsics.reduce<{
    byteSize: number;
    daFees: number;
    daFeesUSD: number;
    daCount: number;
  }>(
    (result, extrinsic) => {
      const summary = submissionSummary(extrinsic);
      result.byteSize += numeric(summary.byteSize);
      result.daFees += numeric(summary.fees);
      result.daFeesUSD += numeric(summary.feesUSD);
      const submissions = extrinsic.dataSubmissions as DaNode | undefined;
      result.daCount += numeric(submissions?.totalCount);
      return result;
    },
    { byteSize: 0, daFees: 0, daFeesUSD: 0, daCount: 0 },
  );
  const blockTimestamp = utcDate(block.timestamp);
  const details: Array<[string, React.ReactNode, boolean?]> = [
    ["Block Hash", <ResponsiveHash key="hash" hash={value(block, "hash")} />],
    [
      "Timestamp",
      <span key="timestamp">
        {Number.isNaN(blockTimestamp.getTime())
          ? formatDate(block.timestamp)
          : blockTimestamp.toLocaleString()}
      </span>,
      true,
    ],
    [
      "Parent Hash",
      <ResponsiveHash key="parent" hash={value(block, "parentHash")} />,
    ],
    [
      "State Root",
      <ResponsiveHash key="state" hash={value(block, "stateRoot")} />,
    ],
    ["Runtime Version", value(block, "runtimeVersion")],
    [
      "Extrinsics Root",
      <ResponsiveHash
        key="extrinsics-root"
        hash={value(block, "extrinsicsRoot")}
      />,
      true,
    ],
    ["DA Count", String(totals.daCount)],
    ["Extrinsics Count", value(block, "nbExtrinsics")],
    ["Events Count", value(block, "nbEvents"), true],
    ["Block Fee", value(block, "blockFee")],
    [
      "Block Fee USD",
      String(numeric(block.blockFee) * numeric(block.availPrice)),
    ],
    ["AVAIL Price", value(block, "availPrice")],
    ["DA Fee", String(totals.daFees)],
    ["DA Fee USD", String(totals.daFeesUSD)],
    ["Data Size", bytes(totals.byteSize)],
  ];
  return (
    <div className="w-full lg:gap-4">
      <div className="w-full rounded-lg border border-base-200 bg-base-100/70">
        <div className="flex w-full flex-wrap items-center justify-between border-b border-base-200 p-5 lg:flex-nowrap">
          <div className="flex items-center gap-4">
            <Box />
            <p>{id}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>{timeAgo(blockTimestamp)}</p>
            <Link
              href={`/avail/blocks/${Number(id) - 1}`}
              className="btn btn-ghost btn-sm w-fit p-1"
            >
              <ChevronLeft />
            </Link>
            <Link
              href={`/avail/blocks/${Number(id) + 1}`}
              className="btn btn-ghost btn-sm p-1"
            >
              <ChevronRight />
            </Link>
          </div>
        </div>
        {details.map(([label, content, bordered]) => (
          <div
            key={label}
            className={`grid w-full grid-cols-[1.5fr_2.5fr] gap-4 p-5 lg:grid-cols-[0.75fr_3fr] lg:gap-0 ${bordered ? "border-b border-base-200" : ""}`}
          >
            <div>{label}</div>
            <div className="break-words">{content}</div>
          </div>
        ))}
      </div>
      <div className="my-5">
        <AvailExtrinsics rows={extrinsics} />
      </div>
    </div>
  );
}

function ResponsiveHash({ hash }: { hash: string }) {
  return (
    <>
      <span className="hidden break-words lg:block">{hash}</span>
      <span className="block break-words lg:hidden">{formatAddress(hash)}</span>
    </>
  );
}

function AvailExtrinsics({ rows }: { rows: DaNode[] }) {
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div className="flex border-b border-base-200 p-4">
        <p>Extrinsics</p>
      </div>
      <div className="hidden items-center border-b border-base-200 p-4 text-end text-sm xl:grid xl:grid-cols-7">
        <div className="flex items-center gap-2 text-start">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
            <NotepadText strokeWidth={1} width={24} height={24} />
          </span>
          Ext #
        </div>
        <p>From</p>
        <p>Module</p>
        <p>DA size</p>
        <p>Position</p>
        <p>Txn fee</p>
        <p>DA fee</p>
      </div>
      <div className="px-4">
        {rows.map((row) => (
          <AvailExtrinsicRow key={value(row, "id")} row={row} />
        ))}
      </div>
    </div>
  );
}

function AvailExtrinsicRow({ row }: { row: DaNode }) {
  const summary = submissionSummary(row);
  const rowTimestamp = utcDate(row.timestamp);
  const id = value(row, "id");
  const signer = value(row, "signer");
  return (
    <div className="border-b border-base-200 py-4 text-sm last:border-b-0">
      <div className="hidden items-center text-end xl:grid xl:grid-cols-7">
        <div className="flex items-center gap-2 text-start">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
            <NotepadText strokeWidth={1} width={24} height={24} />
          </span>
          <div>
            <Link href={`/avail/txn/${id}`} className="text-primary">
              {formatAddress(id)}
            </Link>
            <p>{timeAgo(rowTimestamp)}</p>
          </div>
        </div>
        {signer !== "—" ? (
          <Link href={`/avail/${signer}`} className="text-primary">
            {formatAddress(signer)}
          </Link>
        ) : (
          <p>-</p>
        )}
        {numeric(row.nbEvents) ? (
          <div className="flex justify-end">
            <p className="-mr-2 w-fit rounded-full border border-base-200 p-1 px-2">
              {value(row, "module")}
            </p>
          </div>
        ) : (
          <p>-</p>
        )}
        <p>{bytes(summary.byteSize)}</p>
        <p>
          {value(row, "blockHeight")} : {value(row, "extrinsicIndex")}
        </p>
        <p>{fixed(row.fees, 5)} AVAIL</p>
        <p>{value(summary, "fees")} AVAIL</p>
      </div>
      <div className="flex flex-wrap justify-between gap-2 md:grid md:grid-cols-3 xl:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
            <NotepadText strokeWidth={1} width={24} height={24} />
          </span>
          <div>
            <Link href={`/avail/txn/${id}`} className="text-primary">
              {formatAddress(id)}
            </Link>
            <p>{timeAgo(rowTimestamp)}</p>
          </div>
        </div>
        <p>{bytes(summary.byteSize)}</p>
        <div className="text-end">
          {signer !== "—" ? (
            <Link href={`/avail/${signer}`} className="text-primary">
              From : {formatAddress(signer)}
            </Link>
          ) : null}
          <p>{fixed(row.fees, 5)} AVAIL</p>
        </div>
      </div>
    </div>
  );
}
