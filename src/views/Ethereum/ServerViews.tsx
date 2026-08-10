import Link from "next/link";
import {
  Box,
  Database,
  Globe,
  HardDriveUpload,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import {
  MAX_BLOBS_SIZE_TARGET_ETHEREUM,
  getAccountDetailsFromAddressBook,
} from "@/configs/constants";
import {
  getEthereumAccount,
  getEthereumAccounts,
  getEthereumApp,
  getEthereumApps,
  getEthereumBlock,
  getEthereumBlocks,
  getEthereumDayData,
  enrichEthereumAccounts,
  getEthereumL2BeatData,
  getEthereumSummaryData,
  getEthereumTransaction,
  searchEthereum,
} from "@/lib/ethereum/server";
import EthereumShell from "./components/EthereumShell";
import ServerChart from "./components/ServerChart";
import {
  AccountStatsCharts,
  EthereumUtilizationGauge,
  PriceDayChart,
  StackedAppBarChart,
  type AccountChartPoint,
  type AppChartPoint,
  type AppChartSeries,
  type PriceChartPoint,
} from "./components/EthereumChartIslands";
import { EmptyState, MetricGrid } from "./components/ServerMetrics";
import { ServerPagination } from "@/views/DaServerView";
import { getAppSeriesColor, getAppSeriesId } from "./Stats/DayData/chartSeries";
import SummaryBlocksTableIsland from "./components/SummaryBlocksTableIsland";
import { formatAddress, formatWrapedText } from "@/lib/utils";
import AvailL2BeatServerCard from "../Avail/L2BeatServerCard";
import { timeAgo as originalTimeAgo } from "@/lib/time";
import BigNumber from "bignumber.js";

type AnyRecord = Record<string, any>;

const nodes = (value: AnyRecord | undefined) => value?.nodes || [];
const first = (value: AnyRecord | undefined) => nodes(value)[0];
const number = (value: unknown) => Number(value || 0);
const integer = (value: unknown) =>
  Math.round(number(value)).toLocaleString("en-US");
const money = (value: unknown, digits = 4) =>
  number(value).toLocaleString("en-US", { maximumFractionDigits: digits });
const bytes = (value: unknown) => {
  let current = number(value);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (Math.abs(current) >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${units[unit]}`;
};
const asDate = (value: unknown) => {
  if (typeof value === "number") return new Date(value);
  const text = String(value ?? "");
  return /^\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
};
const date = (value: unknown) =>
  value
    ? asDate(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";
const fullDate = (value: unknown) =>
  value ? asDate(value).toLocaleString("en-US") : "—";
const relativeDate = (value: unknown) => {
  const parsed = asDate(value);
  return Number.isNaN(parsed.getTime()) ? "—" : originalTimeAgo(parsed);
};
const chartDate = (value: unknown) =>
  value
    ? asDate(value).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })
    : "—";
const fullChartDate = (value: unknown) =>
  value
    ? asDate(value).toLocaleString("en-US", {
        timeZoneName: "short",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const short = (value: unknown) => {
  const text = String(value || "").replace(/^\\x/i, "0x");
  return text.length > 16
    ? `${text.slice(0, 9)}…${text.slice(-7)}`
    : text || "—";
};
const safe = async <T,>(request: Promise<T>, fallback: T) => {
  try {
    return await request;
  } catch {
    return fallback;
  }
};

type AppMetric =
  | "totalByteSize"
  | "totalDataSubmissionCount"
  | "totalDAFees"
  | "totalTxnCount";

function appChart(
  rawDays: AnyRecord[],
  metric: AppMetric,
): { points: AppChartPoint[]; series: AppChartSeries[] } {
  const seriesByKey = new Map<string, AppChartSeries>();
  const points = rawDays
    .slice()
    .reverse()
    .map((day: AnyRecord) => {
      const top = nodes(day.appDayDataParticipant);
      const remainder = day.appDayDataParticipantOthers?.aggregates?.sum;
      const participants = remainder
        ? [{ ...remainder, appId: "Other" }, ...top]
        : top;
      const values: Record<string, number> = {};
      for (const participant of participants) {
        const key = getAppSeriesId(participant.appId || participant.id);
        if (!key) continue;
        values[key] = number(values[key]) + number(participant[metric]);
        if (!seriesByKey.has(key)) {
          const details =
            key === "Other"
              ? undefined
              : getAccountDetailsFromAddressBook(key.toLowerCase());
          seriesByKey.set(key, {
            key,
            label: details?.name || key,
            color: getAppSeriesColor(key),
          });
        }
      }
      return {
        label: chartDate(day.timestampStart),
        fullLabel: new Date(day.timestampStart).toDateString(),
        total: Object.values(values).reduce((sum, value) => sum + value, 0),
        values,
      };
    });
  return { points, series: [...seriesByKey.values()] };
}

function priceChartPoints(rawDays: AnyRecord[]): PriceChartPoint[] {
  return rawDays
    .slice()
    .reverse()
    .map((day: AnyRecord) => ({
      label: chartDate(day.timestampStart),
      fullLabel: fullChartDate(day.timestampStart),
      avgNativePrice: number(day.avgNativePrice),
      totalDataSubmissionCount: number(day.totalDataSubmissionCount),
      totalBlobGasUSD: number(day.totalDAFeesUSD) / 10 ** 18,
      totalByteSize: number(day.totalByteSize),
    }));
}

function accountChartPoints(rawDays: AnyRecord[]): AccountChartPoint[] {
  return rawDays
    .slice()
    .reverse()
    .map((day: AnyRecord) => ({
      label: chartDate(day.timestampStart),
      fullLabel: new Date(day.timestampStart).toDateString(),
      totalDataSubmissionCount: number(day.totalDataSubmissionCount),
      totalTxnCount: number(day.totalTxnCount),
      totalByteSize: number(day.totalByteSize),
      totalFees: number(day.totalFees) / 10 ** 18,
    }));
}

function normalizePage(page: number) {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function SummaryView({
  query = "",
  blocksPage = 1,
}: {
  query?: string;
  blocksPage?: number;
}) {
  const safeBlocksPage = normalizePage(blocksPage);
  const blocksPageSize = 10;
  const [summaryData, rollupResult] = await safe(
    Promise.all([
      getEthereumSummaryData(
        (safeBlocksPage - 1) * blocksPageSize,
        blocksPageSize,
      ),
      getEthereumAccounts(0, 4),
    ]),
    [
      [
        { collectiveData: { nodes: [] } },
        { blockData: { nodes: [] } },
        { collectiveDayData: { nodes: [] } },
        { collectiveDayData: { nodes: [] } },
      ],
      { accountEntities: { nodes: [] } },
    ] as any,
  );
  const [collective, blocks, dayData, priceDayData] = summaryData;
  const rollups = await enrichEthereumAccounts(
    nodes(rollupResult?.accountEntities),
  );
  const searchResults = query
    ? await safe(searchEthereum(query), { accounts: [], apps: [] })
    : undefined;
  const summary = first(collective?.collectiveData);
  const sizeChart = appChart(
    nodes(dayData?.collectiveDayData),
    "totalByteSize",
  );
  const pricePoints = priceChartPoints(nodes(priceDayData?.collectiveDayData));

  return (
    <EthereumShell
      title="Ethereum EIP4844"
      active="summary"
      searchQuery={query}
      searchResults={searchResults}
    >
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-base-200/15 p-5 text-sm">
        <p className="lg:w-2/3">
          EIP-4844 allows for blob-carrying transactions containing large
          amounts of data on the consensus layer, and whose commitment can be
          accessed by the EVM on the execution layer.
        </p>
        <div className="flex items-center gap-3">
          <a href="https://ethereum.org" target="_blank" rel="noreferrer">
            <Globe
              className="opacity-70 transition-all hover:opacity-90"
              size={24}
            />
          </a>
          <a href="https://x.com/ethereum" target="_blank" rel="noreferrer">
            <FaXTwitter
              className="opacity-70 transition-all hover:opacity-90"
              size={24}
            />
          </a>
          <a
            href="https://github.com/ethereum"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub
              className="opacity-70 transition-all hover:opacity-90"
              size={24}
            />
          </a>
          <a
            href="https://l2beat.com/data-availability/projects/ethereum/ethereum"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/images/l2beat.png"
              width="34"
              height="34"
              alt="L2BEAT"
              className="opacity-70 transition-all hover:opacity-90"
            />
          </a>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:h-[20em] lg:grid-cols-2">
        <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
          <StackedAppBarChart
            title="Byte Size"
            duration={30}
            points={sizeChart.points}
            series={sizeChart.series}
            format="bytes"
          />
        </div>
        <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
          <PriceDayChart points={pricePoints} />
        </div>
      </div>
      <RollupAccountCards rows={rollups} />
      <ChainStatsPanel summary={summary} />
      <section className="rounded-lg border border-base-200 bg-base-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest blob blocks</h2>
          <Link className="link" href="/ethereum/blocks">View all</Link>
        </div>
        <SummaryBlocksTableIsland
          rows={nodes(blocks?.blockData).map((row: AnyRecord) => ({
            id: String(row.id),
            block: integer(row.id),
            timestamp: date(row.timestamp),
            size: bytes(row.totalBlobSize),
            blobTransactions: integer(row.totalBlobTransactionCount),
            transactions: integer(row.totalTransactionCount),
            events: integer(row.totalEventsCount),
            fees: `${money(number(row.totalBlockFeeNatve) / 1e18)} ETH`,
          }))}
          page={safeBlocksPage}
          pageSize={blocksPageSize}
          totalCount={number(blocks?.blockData?.totalCount)}
        />
      </section>
    </EthereumShell>
  );
}

export async function AccountsView({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
}) {
  const safePage = normalizePage(page);
  const pageSize = 10;
  const result = await safe(
    getEthereumAccounts((safePage - 1) * pageSize, pageSize),
    {
    accountEntities: { nodes: [], totalCount: 0 },
    },
  );
  const enrichedRows = await enrichEthereumAccounts(
    nodes(result.accountEntities),
  );
  const searchResults = query
    ? await safe(searchEthereum(query), { accounts: [], apps: [] })
    : undefined;
  return (
    <EthereumShell
      title="Rollup Accounts"
      active="apps"
      searchQuery={query}
      searchResults={searchResults}
    >
      <section className="rounded-lg border border-base-200 bg-base-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Accounts by blob data</h2>
          <span className="text-sm opacity-60">
            {integer(result.accountEntities?.totalCount)} total
          </span>
        </div>
        <AccountTable
          rows={enrichedRows}
          page={safePage}
          pageSize={pageSize}
          totalCount={number(result.accountEntities?.totalCount)}
        />
      </section>
    </EthereumShell>
  );
}

export async function AppsView({ query = "" }: { query?: string }) {
  const result = await safe(getEthereumApps(), {
    appEntities: { nodes: [], totalCount: 0 },
  });
  const searchResults = query
    ? await safe(searchEthereum(query), { accounts: [], apps: [] })
    : undefined;
  return (
    <EthereumShell
      title="Rollups"
      active="apps"
      searchQuery={query}
      searchResults={searchResults}
    >
      <section className="rounded-lg border border-base-200 bg-base-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rollups by blob data</h2>
          <span className="text-sm opacity-60">
            {integer(result.appEntities?.totalCount)} total
          </span>
        </div>
        <AppTable rows={nodes(result.appEntities)} />
      </section>
    </EthereumShell>
  );
}

export async function StatsView({ duration = 15 }: { duration?: number }) {
  const [summaryData, utilizationBlocks] = await safe(
    Promise.all([getEthereumSummaryData(), getEthereumBlocks(0, 100)]),
    [
      [
        { collectiveData: { nodes: [] } },
        { blockData: { nodes: [] } },
        { collectiveDayData: { nodes: [] } },
        { collectiveDayData: { nodes: [] } },
      ],
      { blockData: { nodes: [] } },
    ] as any,
  );
  const [, , initialDayData] = summaryData;
  const selectedDayData =
    duration === 15
      ? {
          collectiveDayData: {
            nodes: nodes(initialDayData?.collectiveDayData).slice(0, 15),
          },
        }
      : await safe(getEthereumDayData(duration), {
          collectiveDayData: { nodes: [] },
        });
  const rawDays = nodes(selectedDayData?.collectiveDayData);
  const sizeChart = appChart(rawDays, "totalByteSize");
  const submissionsChart = appChart(rawDays, "totalDataSubmissionCount");
  const feesChart = appChart(rawDays, "totalDAFees");
  const transactionChart = appChart(rawDays, "totalTxnCount");
  return (
    <EthereumShell title="EIP 4844 Stats" active="stats">
      <UtilizationPanel rows={nodes(utilizationBlocks?.blockData)} />
      <section className="mt-4 border border-base-200 bg-base-100">
        <div className="flex items-center justify-between border-b border-base-200 p-5">
          <p>EIP 4844 Stats</p>
          <div className="flex gap-2">
            {[7, 30, 90].map((value) => (
              <Link
                key={value}
                href={`/ethereum/stats/${value}d`}
                className={`btn btn-sm ${value === duration ? "btn-primary" : ""}`}
              >
                {value}d
              </Link>
            ))}
          </div>
        </div>
        <div className="grid lg:h-[20em] lg:grid-cols-2">
          <div className="h-[20em] border-r border-base-200 p-5">
            <StackedAppBarChart
              title="Byte Size"
              duration={duration}
              points={sizeChart.points}
              series={sizeChart.series}
              format="bytes"
            />
          </div>
          <div className="h-[20em] p-5">
            <StackedAppBarChart
              title="DA Subs"
              duration={duration}
              points={submissionsChart.points}
              series={submissionsChart.series}
              format="number"
            />
          </div>
        </div>
        <div className="grid border-t border-base-200 lg:h-[20em] lg:grid-cols-2">
          <div className="h-[20em] border-r border-base-200 p-5">
            <StackedAppBarChart
              title="DA Fees"
              duration={duration}
              points={feesChart.points}
              series={feesChart.series}
              format="eth"
            />
          </div>
          <div className="h-[20em] p-5">
            <StackedAppBarChart
              title="Transactions"
              duration={duration}
              points={transactionChart.points}
              series={transactionChart.series}
              format="number"
            />
          </div>
        </div>
      </section>
    </EthereumShell>
  );
}

export async function SingleAccountView({
  account,
  txnPage = 1,
  basePath,
}: {
  account: string;
  txnPage?: number;
  basePath?: string;
}) {
  const safeTxnPage = normalizePage(txnPage);
  const txnPageSize = 10;
  const [accountData, l2BeatData] = await safe(
    Promise.all([
      getEthereumAccount(
        account,
        (safeTxnPage - 1) * txnPageSize,
        txnPageSize,
      ),
      getEthereumL2BeatData(account),
    ]),
    [
      [
        { accountEntity: undefined },
        { transactionData: { nodes: [] } },
        { accountDayData: { nodes: [] } },
      ],
      null,
    ] as any,
  );
  const [accountResult, transactionResult, dayResult] = accountData;
  const data = accountResult?.accountEntity;
  const chartPoints = accountChartPoints(nodes(dayResult?.accountDayData));
  return (
    <EthereumShell
      title="Rollup Account"
      eyebrow="Ethereum account"
      compactHeader
    >
      {!data ? (
        <EmptyState message="Account data was not found." />
      ) : (
        <>
          <AvailL2BeatServerCard
            data={l2BeatData}
            logoOverride={
              getAccountDetailsFromAddressBook(account.toLowerCase())
                ?.logoUri || "/images/logox.jpeg"
            }
          />
          <AccountDetailCard data={data} />
          <div className="mt-6">
            <AccountStatsCharts points={chartPoints} />
          </div>
          <section className="mt-6 rounded-lg border border-base-200 bg-base-100 p-4">
            <h2 className="mb-4 text-lg font-semibold">Recent transactions</h2>
            <TransactionTable
              rows={nodes(transactionResult?.transactionData)}
              pagination={{
                page: safeTxnPage,
                pageSize: txnPageSize,
                totalCount: number(transactionResult?.transactionData?.totalCount),
                basePath:
                  basePath || `/ethereum/${encodeURIComponent(account)}`,
                paramName: "txnPage",
              }}
            />
          </section>
        </>
      )}
    </EthereumShell>
  );
}

export async function SingleAppView({
  appId,
  txnPage = 1,
}: {
  appId: string;
  txnPage?: number;
}) {
  const safeTxnPage = normalizePage(txnPage);
  const txnPageSize = 10;
  const [appData, l2BeatData] = await safe(
    Promise.all([
      getEthereumApp(
        appId,
        (safeTxnPage - 1) * txnPageSize,
        txnPageSize,
      ),
      getEthereumL2BeatData(appId),
    ]),
    [
      [
        { accountEntity: undefined },
        { transactionData: { nodes: [] } },
        { accountDayData: { nodes: [] } },
      ],
      null,
    ] as any,
  );
  const [appResult, transactionResult, dayResult] = appData;
  const data = appResult?.accountEntity;
  const chartPoints = accountChartPoints(nodes(dayResult?.accountDayData));
  return (
    <EthereumShell
      title="Rollup Account"
      eyebrow="Ethereum rollup"
      compactHeader
    >
      {!data ? (
        <EmptyState message="Rollup data was not found." />
      ) : (
        <>
          <AvailL2BeatServerCard
            data={l2BeatData}
            logoOverride={
              getAccountDetailsFromAddressBook(appId.toLowerCase())?.logoUri ||
              "/images/logox.jpeg"
            }
          />
          <AccountDetailCard data={data} />
          <div className="mt-6">
            <AccountStatsCharts points={chartPoints} />
          </div>
          <section className="mt-6 rounded-lg border border-base-200 bg-base-100 p-4">
            <h2 className="mb-4 text-lg font-semibold">Recent transactions</h2>
            <TransactionTable
              rows={nodes(transactionResult?.transactionData)}
              pagination={{
                page: safeTxnPage,
                pageSize: txnPageSize,
                totalCount: number(transactionResult?.transactionData?.totalCount),
                basePath: `/ethereum/apps/${encodeURIComponent(appId)}`,
                paramName: "txnPage",
              }}
            />
          </section>
        </>
      )}
    </EthereumShell>
  );
}

export async function BlocksView({ page = 1 }: { page?: number } = {}) {
  const safePage = normalizePage(page);
  const pageSize = 10;
  const result = await safe(
    getEthereumBlocks((safePage - 1) * pageSize, pageSize),
    { blockData: { nodes: [], totalCount: 0 } },
  );
  return (
    <EthereumShell title="Blob Blocks" active="summary">
      <section className="rounded-lg border border-base-200 bg-base-100 p-4">
        <BlockTable
          rows={nodes(result.blockData)}
          pagination={{
            page: safePage,
            pageSize,
            totalCount: number(result.blockData?.totalCount),
            basePath: "/ethereum/blocks",
          }}
        />
      </section>
    </EthereumShell>
  );
}

export async function SingleBlockView({
  blockNumber,
}: {
  blockNumber: string;
}) {
  const result = await safe(getEthereumBlock(blockNumber), {
    blockDatum: undefined,
  });
  const block = result.blockDatum;
  return (
    <EthereumShell
      title="Ethereum Block"
      eyebrow="Ethereum blob block"
      compactHeader
    >
      {!block ? (
        <EmptyState message={`#${blockNumber} Block is not synced yet.`} />
      ) : (
        <>
          <DetailCard
            title={String(blockNumber)}
            icon={<Box width={24} height={24} />}
            rows={[
              ["Block Hash", block.hash || "—"],
              ["Timestamp", fullDate(block.timestamp)],
              ["DA Count", integer(block.totalBlobTransactionCount)],
              ["Extrinsics Count", integer(block.totalTransactionCount)],
              ["Events Count", integer(block.totalEventsCount)],
              [
                "Block Fee",
                `${money(number(block.totalBlockFeeNatve) / 1e18)} ETH`,
              ],
              [
                "Block Fee USD",
                `$${money(number(block.totalBlockFeeUSD) / 1e18, 2)}`,
              ],
            ]}
          />
          <section className="mt-4">
            <TransactionTable rows={nodes(block.transactions)} />
          </section>
        </>
      )}
    </EthereumShell>
  );
}

export async function SingleTxnView({ hash }: { hash: string }) {
  const result = await safe(getEthereumTransaction(hash), {
    transactionDatum: undefined,
  });
  const transaction = result.transactionDatum;
  return (
    <EthereumShell
      title="Ethereum Txn"
      eyebrow="Ethereum blob transaction"
      compactHeader
    >
      {!transaction ? (
        <EmptyState message={`#${short(hash)} is not synced yet.`} />
      ) : (
        <EthereumTxnDetail hash={hash} transaction={transaction} />
      )}
    </EthereumShell>
  );
}

function ethereumAmount(value: unknown): string {
  return new BigNumber(String(value ?? 0)).div(1e18).toString();
}

function EthereumTxnDetail({
  hash,
  transaction,
}: {
  hash: string;
  transaction: AnyRecord;
}) {
  const signer = String(transaction.signerId || "").replace(/^"|"$/g, "");
  const transactionHash = String(transaction.id || hash);
  const rows: Array<{
    label: string;
    content: ReactNode;
    bordered?: boolean;
  }> = [
    {
      label: "Txn Hash",
      content: <ResponsiveEthereumValue value={transactionHash} address />,
    },
    {
      label: "Signer",
      content: signer ? (
        <>
          <Link
            href={`/ethereum/${signer}`}
            className="hidden break-words text-primary lg:block"
          >
            {signer}
          </Link>
          <Link
            href={`/ethereum/${signer}`}
            className="block break-words text-primary lg:hidden"
          >
            {formatAddress(signer)}
          </Link>
        </>
      ) : (
        "—"
      ),
    },
    {
      label: "Timestamp",
      content: relativeDate(transaction.timestamp),
      bordered: true,
    },
    {
      label: "DA Count",
      content: integer(nodes(transaction.blobs).length),
    },
    {
      label: "Events Count",
      content: integer(transaction.nEvents),
      bordered: true,
    },
    {
      label: "Txn Fee",
      content: `${ethereumAmount(transaction.txFeeNative)} ETH`,
    },
    {
      label: "Txn Fee USD",
      content: `${ethereumAmount(transaction.txFeeUSD)} USD`,
    },
    {
      label: "DA Fee",
      content: `${ethereumAmount(transaction.txFeeNative)} ETH`,
    },
    {
      label: "DA Fee USD",
      content: `${ethereumAmount(transaction.txFeeUSD)} USD`,
    },
    {
      label: "ETH Price",
      content: `${new BigNumber(
        String(transaction.blockHeight?.currentNativePrice ?? 0),
      ).toString()}USD`,
    },
    {
      label: "Data Size",
      content: bytes(transaction.totalBytes),
    },
  ];
  return (
    <div className="w-full lg:gap-4">
      <div className="w-full rounded-lg border border-base-200 bg-base-100/70">
        <div className="flex w-full flex-wrap items-center justify-between border-b border-base-200 p-5 lg:flex-nowrap">
          <div className="flex min-w-0 items-center gap-4">
            <NotepadText className="shrink-0" />
            <ResponsiveEthereumValue value={hash} address />
          </div>
          <p className="shrink-0">{relativeDate(transaction.timestamp)}</p>
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className={`grid w-full grid-cols-[1.5fr_2.5fr] gap-4 p-5 lg:grid-cols-[0.75fr_3fr] lg:gap-0 ${row.bordered ? "border-b border-base-200" : ""}`}
          >
            <div>{row.label}</div>
            <div className="min-w-0 break-words">{row.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponsiveEthereumValue({
  value,
  address = false,
}: {
  value: string;
  address?: boolean;
}) {
  return (
    <>
      <span className="hidden min-w-0 break-words lg:block">{value}</span>
      <span className="block min-w-0 break-words lg:hidden">
        {address ? formatAddress(value) : value}
      </span>
    </>
  );
}

export function ChartView({
  label = "Ethereum data",
  points = [],
}: {
  label?: string;
  points?: PointLike[];
}) {
  return (
    <ServerChart
      label={label}
      points={points.map((point) => ({
        label: point.label,
        value: number(point.value),
      }))}
    />
  );
}

type PointLike = { label?: string; value?: number };

function AccountDetailCard({ data }: { data: AnyRecord }) {
  const accountDetails = getAccountDetailsFromAddressBook(
    String(data.id || "").toLowerCase(),
  );
  return (
    <div className="rounded-lg border border-base-300/30 bg-base-100/80">
      <div className="flex h-[4em] items-center gap-2 border-b border-base-200/50 p-4">
        <ImageWithFallback
          src={
            accountDetails?.logoUri ||
            "https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true"
          }
          fallback="/images/ethereum_logo.png"
          width={24}
          height={24}
          alt=""
          className="rounded-lg"
        />
        <Link href={`/ethereum/${data.id}`} className="text-primary">
          {accountDetails?.name || formatWrapedText(String(data.id || ""))}
        </Link>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="border-r border-base-200/50">
          <DetailStat
            label="Transactions Count"
            value={integer(data.totalTxnCount)}
            icon={<NotepadText />}
          />
          <DetailStat
            label="DA size"
            value={bytes(data.totalByteSize)}
            icon={<Database />}
          />
          <DetailStat
            label="Total DA subs"
            value={integer(data.totalDataSubmissionCount)}
            icon={<HardDriveUpload />}
          />
          <DetailStat
            label="DA Fees"
            value={`${money(number(data.totalDAFees) / 1e18, 2)} ETH`}
            icon={
              <ImageWithFallback
                src="https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true"
                fallback="/images/ethereum_logo.png"
                width={24}
                height={24}
                alt="ETH"
              />
            }
          />
          <DetailStat
            label="DA Fees USD"
            value={`$${money(number(data.totalDAFeesUSD) / 1e18, 2)}`}
            icon={<Receipt />}
          />
        </div>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p>{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function DetailCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: ReactNode;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="w-full rounded-lg border border-base-200 bg-base-100/70">
      <div className="flex items-center justify-between border-b border-base-200 p-5">
        <div className="flex items-center gap-4">
          <span>{icon}</span>
          <p>{title}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ethereum/blocks" className="btn btn-ghost btn-sm">
            ←
          </Link>
          <Link href="/ethereum/blocks" className="btn btn-ghost btn-sm">
            →
          </Link>
        </div>
      </div>
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={`grid gap-4 p-5 lg:grid-cols-[0.75fr_3fr] ${index === rows.length - 1 ? "" : "border-b border-base-200"}`}
        >
          <div>{label}</div>
          <div className="break-words">{value}</div>
        </div>
      ))}
    </div>
  );
}

function RollupAccountCards({ rows }: { rows: AnyRecord[] }) {
  if (!rows.length) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {rows.map((rollup, index) => {
        const accountDetails = getAccountDetailsFromAddressBook(
          String(rollup.id || "").toLowerCase(),
        );
        const name =
          rollup.name ||
          accountDetails?.name ||
          formatWrapedText(String(rollup.id || ""));
        const logo =
          rollup.logoUri ||
          accountDetails?.logoUri ||
          "https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true";
        return (
          <div
            key={`${rollup.id}-${name}-${index}`}
            className="space-y-3 rounded-lg bg-base-200/15 p-5"
          >
            <div className="flex gap-3">
              <ImageWithFallback
                src={logo}
                fallback="/images/ethereum_logo.png"
                width={24}
                height={24}
                alt=""
                className="rounded-lg"
              />
              <Link
                href={`/ethereum/apps/${rollup.id}`}
                className="text-primary"
              >
                {formatWrapedText(String(name), 6, 9)}
              </Link>
            </div>
            <hr className="border-base-200/50" />
            <div className="flex justify-between gap-2">
              <p>Size</p>
              <p>{bytes(rollup.totalByteSize)}</p>
            </div>
            <div className="flex justify-between gap-2">
              <p>Fees</p>
              <p>
                {(number(rollup.totalDAFees) / 1e18).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ETH
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <p>Fees USD</p>
              <p>
                $
                {(number(rollup.totalDAFeesUSD) / 1e18).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChainStatsPanel({ summary }: { summary?: AnyRecord }) {
  const size = bytes(summary?.totalByteSize).split(" ");
  const cards = [
    ["Last block", integer(summary?.endBlock)],
    ["Txn Fees", `${money(number(summary?.totalFeesNative) / 1e18)} ETH`],
    ["Total data", `${size[0]} ${size[1] || "B"}`],
    ["Total Txns", integer(summary?.totalTxnCount)],
    ["DA Submissions", integer(summary?.totalDataSubmissionCount)],
    ["Total DA Fees", `${money(number(summary?.totalDAFees) / 1e18)} ETH`],
    [
      "Total DA Fees [usd]",
      `$${money(number(summary?.totalDAFeesUSD) / 1e18, 2)}`,
    ],
    ["Last ETH Price", `${money(summary?.lastPriceFeed?.nativePrice, 2)} USD`],
  ];
  return (
    <div className="grid gap-0 rounded-lg lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="h-full w-full space-y-2 border-[0.5px] border-base-200 bg-base-100 p-4"
        >
          <p className="text-sm opacity-50">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function UtilizationPanel({ rows }: { rows: AnyRecord[] }) {
  const totalSize = rows.reduce(
    (sum, row) => sum + number(row.totalBlobSize),
    0,
  );
  const totalBlobTx = rows.reduce(
    (sum, row) => sum + number(row.totalBlobTransactionCount),
    0,
  );
  const averageSize = rows.length ? totalSize / rows.length : 0;
  const maxSize = Number(MAX_BLOBS_SIZE_TARGET_ETHEREUM);
  const utilization = Math.min(100, (averageSize / maxSize) * 100);
  const latest = number(rows[0]?.id);
  const averageBlobCount = rows.length ? totalBlobTx / rows.length : 0;
  return (
    <div className="w-full rounded-lg border border-base-200 p-1">
      <div className="rounded-lg bg-base-100">
        <p className="w-full border-b border-base-200 p-3 text-xs">
          Space Utilization [Last 100 Blocks]
        </p>
        <EthereumUtilizationGauge
          blockHeight={latest}
          utilizationPercent={utilization}
          averageSize={averageSize}
          averageBlobCount={averageBlobCount}
          maxSize={maxSize}
        />
      </div>
    </div>
  );
}

function AccountTable({
  rows,
  page,
  pageSize,
  totalCount,
}: {
  rows: AnyRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  if (!rows.length) return <EmptyState message="No account data available." />;
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div className="hidden items-center border-b border-base-200 px-4 py-4 text-sm xl:grid xl:grid-cols-6">
        <div className="col-span-2">Address</div>
        <p>Size</p>
        <p>Data Subs</p>
        <p>Transactions</p>
        <p>Fees</p>
      </div>
      <div className="px-4">
        {rows.map((row) => {
          const accountDetails = getAccountDetailsFromAddressBook(
            String(row.id || "").toLowerCase(),
          );
          const accountLabel =
            row.name ||
            accountDetails?.name ||
            formatWrapedText(String(row.id || ""));
          const accountLogo =
            row.logoUri ||
            accountDetails?.logoUri ||
            "https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true";
          return <div key={row.id}>
            <div className="hidden items-center border-b border-base-200 py-4 text-sm xl:grid xl:grid-cols-6">
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                  <ImageWithFallback
                    src={accountLogo}
                    fallback="/images/ethereum_logo.png"
                    className="rounded-lg"
                    width={24}
                    height={24}
                    alt=""
                  />
                </div>
                <Link className="text-primary" href={`/ethereum/${row.id}`}>
                  {accountLabel}
                </Link>
              </div>
              <p>{bytes(row.totalByteSize)}</p>
              <p>{integer(row.totalDataSubmissionCount)}</p>
              <p>{integer(row.totalTxnCount)}</p>
              <p>
                {money(number(row.totalFees) / 1e18)} ETH
                <br />
                <span className="text-xs opacity-70">
                  ${money(number(row.totalFeesUSD) / 1e18, 2)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-base-200 py-3 text-sm xl:hidden">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                    <ImageWithFallback
                      src={accountLogo}
                      fallback="/images/ethereum_logo.png"
                      className="rounded-lg"
                      width={24}
                      height={24}
                      alt=""
                    />
                  </div>
                  <Link className="text-primary" href={`/ethereum/${row.id}`}>
                    {accountLabel}
                  </Link>
                </div>
                <p>{bytes(row.totalByteSize)}</p>
              </div>
            </div>
          </div>;
        })}
      </div>
      {totalCount > pageSize ? (
        <div className="flex justify-end gap-2 border-t border-base-200 p-4 px-4">
          {page > 1 ? (
            <Link className="btn btn-outline btn-sm" href={`?page=${page - 1}`}>
              Prev
            </Link>
          ) : null}
          {page * pageSize < totalCount ? (
            <Link className="btn btn-outline btn-sm" href={`?page=${page + 1}`}>
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AppTable({ rows }: { rows: AnyRecord[] }) {
  if (!rows.length) return <EmptyState message="No rollup data available." />;
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Rollup</th>
            <th>Blob data</th>
            <th>Transactions</th>
            <th>DA fees</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link className="link" href={`/ethereum/apps/${row.id}`}>
                  {row.name || short(row.id)}
                </Link>
              </td>
              <td>{bytes(row.totalByteSize)}</td>
              <td>{integer(row.totalTxnCount)}</td>
              <td>{money(number(row.totalDAFees) / 1e18)} ETH</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type PaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  basePath: string;
  paramName?: string;
};

function BlockTable({
  rows,
  pagination,
}: {
  rows: AnyRecord[];
  pagination?: PaginationProps;
}) {
  if (!rows.length) return <EmptyState message="No block data available." />;
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div className="hidden items-center border-b border-base-200 px-4 py-4 text-sm xl:grid xl:grid-cols-7">
        <div className="col-span-2">Block</div>
        <p>Size</p>
        <p>Blob Txn</p>
        <p>Txns</p>
        <p>Events</p>
        <p>Fees</p>
      </div>
      <div className="px-4">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="hidden items-center border-b border-base-200 py-4 text-sm xl:grid xl:grid-cols-7">
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                  <Box strokeWidth={1} width={24} height={24} />
                </div>
                <div>
                  <Link
                    className="text-primary"
                    href={`/ethereum/blocks/${row.id}`}
                  >
                    {integer(row.id)}
                  </Link>
                  <p>{date(row.timestamp)}</p>
                </div>
              </div>
              <p>{bytes(row.totalBlobSize)}</p>
              <p>{integer(row.totalBlobTransactionCount)}</p>
              <p>{integer(row.totalTransactionCount)}</p>
              <p>{integer(row.totalEventsCount)}</p>
              <p>{money(number(row.totalBlockFeeNatve) / 1e18)} ETH</p>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-base-200 py-3 text-sm xl:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                  <Box strokeWidth={1} width={24} height={24} />
                </div>
                <div>
                  <Link
                    className="text-primary"
                    href={`/ethereum/blocks/${row.id}`}
                  >
                    {integer(row.id)}
                  </Link>
                  <p>{date(row.timestamp)}</p>
                </div>
              </div>
              <div className="text-end">
                <p>{bytes(row.totalBlobSize)}</p>
                <p>{money(number(row.totalBlockFeeNatve) / 1e18)} ETH</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pagination ? <ServerPagination {...pagination} /> : null}
    </div>
  );
}

function TransactionTable({
  rows,
  pagination,
}: {
  rows: AnyRecord[];
  pagination?: PaginationProps;
}) {
  if (!rows.length)
    return <EmptyState message="No transaction data available." />;
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div className="border-b border-base-200 p-4">Transactions</div>
      <div className="hidden items-center border-b border-base-200 p-4 text-end text-sm xl:grid xl:grid-cols-5">
        <div className="text-start">Txn #</div>
        <p>From</p>
        <p>Module</p>
        <p>DA size</p>
        <p>DA fee</p>
      </div>
      <div className="px-4">
        {rows.map((row) => {
          const hash = String(row.hash || row.id || "").replace(/^\\x/i, "0x");
          const fee = money(number(row.txFeeNative) / 1e18, 5);
          return (
            <div key={row.id || row.hash}>
              <div className="hidden items-center border-b border-base-200 py-4 text-end text-sm xl:grid xl:grid-cols-5">
                <div className="flex items-center gap-2 text-start">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                    <NotepadText strokeWidth={1} width={24} height={24} />
                  </div>
                  <div>
                    <Link
                      className="text-primary"
                      href={`/ethereum/txn/${hash}`}
                    >
                      {short(hash)}
                    </Link>
                    <p>{relativeDate(row.timestamp)}</p>
                  </div>
                </div>
                <p>{short(row.signerId)}</p>
                <p>{row.nEvents || "-"}</p>
                <p>{bytes(row.totalBytes)}</p>
                <p>{fee} ETH</p>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-t border-base-200 py-3 text-sm xl:hidden">
                <div className="flex items-center gap-2">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-base-200/50">
                    <NotepadText strokeWidth={1} width={24} height={24} />
                  </div>
                  <div>
                    <Link
                      className="text-primary"
                      href={`/ethereum/txn/${hash}`}
                    >
                      {short(hash)}
                    </Link>
                    <p>{relativeDate(row.timestamp)}</p>
                  </div>
                </div>
                <p>{bytes(row.totalBytes)}</p>
                <p>{fee} ETH</p>
              </div>
            </div>
          );
        })}
      </div>
      {pagination ? <ServerPagination {...pagination} /> : null}
    </div>
  );
}

function BlobTable({ rows }: { rows: AnyRecord[] }) {
  if (!rows.length) return <EmptyState message="No blob payloads available." />;
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Signer</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.signer}-${index}`}>
              <td>{short(row.signer)}</td>
              <td>{bytes(row.size)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
