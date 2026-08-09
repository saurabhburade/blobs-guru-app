import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import DaClientChart from "@/views/DaClientChart";
import {
  Box,
  Database,
  Globe,
  HardDriveUpload,
  NotepadText,
  Receipt,
  User,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { DaChain, DaNode } from "@/lib/da/server";
import PoweredBy from "@/views/Home/components/PoweredBy";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  getAccountDetailsFromAddressBook,
  getAppDetailsFromAppBook,
} from "@/configs/constants";
import {
  formatAddress as formatOriginalAddress,
  formatWrapedText,
  parseCelestiaString,
} from "@/lib/utils";

const chainLabels: Record<
  DaChain,
  { name: string; symbol: string; icon: string }
> = {
  celestia: {
    name: "Celestia DA",
    symbol: "TIA",
    icon: "/images/celestia_logo.png",
  },
  avail: { name: "Avail DA", symbol: "AVAIL", icon: "/images/avail_logo.png" },
};

export function value(node: DaNode | null | undefined, key: string): string {
  const item = node?.[key];
  if (item === null || item === undefined || item === "") return "—";
  if (typeof item === "object") return JSON.stringify(item);
  return String(item);
}

export function numeric(item: unknown): number {
  const result = Number(item);
  return Number.isFinite(result) ? result : 0;
}

export function compact(item: unknown): string {
  const result = numeric(item);
  if (!result && item !== 0 && item !== "0") return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(result);
}

export function bytes(item: unknown): string {
  const result = numeric(item);
  if (!result) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(result) / Math.log(1024)),
    units.length - 1,
  );
  return `${(result / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export function fixed(item: unknown, digits = 4): string {
  const result = numeric(item);
  return result || item === 0 || item === "0" ? result.toFixed(digits) : "—";
}

export function formatDate(item: unknown): string {
  if (!item) return "—";
  const date = new Date(String(item));
  return Number.isNaN(date.getTime()) ? String(item) : date.toLocaleString();
}

export function timeAgo(item: unknown): string {
  if (!item) return "—";
  const text = String(item);
  const date = /^\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
  if (Number.isNaN(date.getTime())) return String(item);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ServerPagination({
  page,
  pageSize,
  totalCount,
  basePath,
  paramName = "page",
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  basePath: string;
  paramName?: string;
}) {
  if (totalCount <= pageSize) return null;
  const pageHref = (target: number) =>
    `${basePath}?${new URLSearchParams({ [paramName]: String(target) })}`;
  return (
    <div className="flex justify-end gap-2 border-t border-base-200 p-4 px-4">
      {page > 1 ? (
        <Link
          className="btn btn-outline btn-sm"
          href={pageHref(page - 1)}
          scroll={false}
        >
          Prev
        </Link>
      ) : null}
      {page * pageSize < totalCount ? (
        <Link
          className="btn btn-outline btn-sm"
          href={pageHref(page + 1)}
          scroll={false}
        >
          Next
        </Link>
      ) : null}
    </div>
  );
}

export function short(item: unknown, start = 8, end = 8): string {
  const text = String(item ?? "");
  return text.length > start + end + 1
    ? `${text.slice(0, start)}…${text.slice(-end)}`
    : text || "—";
}

export function ServerSearch({ chain }: { chain: DaChain }) {
  return (
    <form
      action={`/${chain}/search`}
      method="get"
      className="join w-full lg:w-2/3"
    >
      <label htmlFor={`${chain}-search`} className="sr-only">
        Search {chainLabels[chain].name}
      </label>
      <input
        id={`${chain}-search`}
        name="q"
        type="search"
        maxLength={80}
        className="input join-item w-full input-bordered outline-none placeholder:text-sm focus:outline-none active:outline-none"
        placeholder="Search Account / App"
      />
      <button className="btn join-item rounded-r-full" type="submit">
        Search
      </button>
    </form>
  );
}

function ChainHeader({
  chain,
  title,
  compact,
}: {
  chain: DaChain;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {!compact ? (
        <ImageWithFallback
          src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${chain}.png`}
          fallback={chainLabels[chain].icon}
          className="rounded-lg"
          width={24}
          height={24}
          alt=""
        />
      ) : null}
      <p className={compact ? "text-xl font-semibold" : "text-2xl font-bold"}>
        {title}
      </p>
    </div>
  );
}

function SocialLinks({ chain }: { chain: DaChain }) {
  const links: Array<[ReactNode, string]> =
    chain === "celestia"
      ? [
          [<Globe key="website" size={24} />, "https://celestia.org"],
          [<FaXTwitter key="x" size={24} />, "https://x.com/Celestia"],
          [
            <FaTelegramPlane key="telegram" size={24} />,
            "https://t.me/CelestiaCommunity",
          ],
          [
            <FaGithub key="github" size={24} />,
            "https://github.com/celestiaorg",
          ],
        ]
      : [
          [<Globe key="website" size={24} />, "https://www.availproject.org/"],
          [<FaXTwitter key="x" size={24} />, "https://x.com/AvailProject"],
          [
            <FaTelegramPlane key="telegram" size={24} />,
            "https://t.me/AvailCommunity",
          ],
          [
            <FaGithub key="github" size={24} />,
            "https://github.com/availproject/",
          ],
        ];
  return (
    <div className="flex items-center gap-3">
      {links.map(([icon, href]) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          referrerPolicy="no-referrer"
          className="cursor-pointer opacity-70 transition-all hover:opacity-90"
        >
          {icon}
        </Link>
      ))}
      <Link
        href={
          chain === "celestia"
            ? "https://l2beat.com/data-availability/projects/celestia/no-bridge"
            : "https://l2beat.com/data-availability/projects/avail/no-bridge"
        }
        target="_blank"
        referrerPolicy="no-referrer"
      >
        <img
          src="/images/l2beat.png"
          width="34"
          height="34"
          alt="L2Beat"
          className="opacity-70 hover:opacity-100"
        />
      </Link>
    </div>
  );
}

export function ChainDescription({ chain }: { chain: DaChain }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-base-200/15 p-5 text-sm lg:flex-nowrap">
      <p className="lg:w-1/2">
        {chain === "celestia"
          ? "Celestia is a modular data availability network that allows L2s to post arbitrary data as blobs."
          : "Avail is a public blockchain and data availability network combining erasure coding, KZG polynomial commitments, and data availability sampling."}
      </p>
      <SocialLinks chain={chain} />
    </div>
  );
}

export function ChainShell({
  chain,
  title,
  children,
  search = true,
  description = false,
  compactHeader = false,
}: {
  chain: DaChain;
  title: string;
  children: ReactNode;
  search?: boolean;
  description?: boolean;
  compactHeader?: boolean;
}) {
  return (
    <div className="grid h-screen gap-0 xl:grid-cols-[1.25fr_5fr]">
      <div className="hidden xl:block">
        <Sidebar />
      </div>
      <div className="block xl:hidden">
        <Header />
      </div>
      <div className="flex h-screen min-h-[90vh] flex-col space-y-4 overflow-scroll p-5 pb-10">
        {
          <div className="my-[5em] flex w-full flex-col items-center justify-between gap-4 lg:my-0 lg:flex-row">
            {" "}
            <ChainHeader chain={chain} title={title} compact={compactHeader} />
            {search ? (
              <div className="flex justify-end lg:w-1/2">
                <ServerSearch chain={chain} />
              </div>
            ) : null}
          </div>
        }
        {description ? <ChainDescription chain={chain} /> : null}
        <div className="w-full space-y-4">{children}</div>
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export function StatCard({
  title,
  item,
  suffix,
  prefix,
}: {
  title: string;
  item: unknown;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="h-full w-full space-y-2 border-[0.5px] border-base-200 bg-base-100 p-4">
      <p className="text-sm opacity-50">{title}</p>
      <p>
        {prefix}
        {typeof item === "number" ? compact(item) : String(item ?? "—")}{" "}
        {suffix}
      </p>
    </div>
  );
}

export function MetricGrid({
  metrics,
}: {
  metrics: Array<[string, unknown, string?, string?]>;
}) {
  return (
    <div className="grid w-full gap-0 rounded-lg lg:grid-cols-4">
      {metrics.map(([title, item, suffix, prefix]) => (
        <StatCard
          key={title}
          title={title}
          item={item}
          suffix={suffix}
          prefix={prefix}
        />
      ))}
    </div>
  );
}

export function AppCards({ chain, apps }: { chain: DaChain; apps: DaNode[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {apps.slice(0, 4).map((app, index) => {
        const details = getAppDetailsFromAppBook(value(app, "id"));
        return <div
          key={`${value(app, "id")}-${index}`}
          className="space-y-3 rounded-lg bg-base-200/15 p-5"
        >
          <div className="flex gap-3">
            <ImageWithFallback
              src={
                details?.logoUri ||
                `https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${chain}.png?raw=true`
              }
              fallback={chainLabels[chain].icon}
              width={24}
              height={24}
              alt=""
              className="rounded-lg"
            />
            <Link
              href={`/${chain}/apps/${encodeURIComponent(value(app, "id"))}`}
              className="text-primary"
            >
              {details?.name ||
                formatWrapedText(
                  value(app, "name") !== "—"
                    ? value(app, "name")
                    : value(app, "id"),
                  6,
                  9,
                )}
            </Link>
          </div>
          <hr className="border-base-200/50" />
          <div className="flex justify-between gap-2">
            <p>Size</p>
            <p>{bytes(value(app, "totalByteSize"))}</p>
          </div>
          <div className="flex justify-between gap-2">
            <p>Fees</p>
            <p>
              {fixed(
                value(
                  app,
                  chain === "celestia" ? "totalFeesNative" : "totalFeesAvail",
                ),
                2,
              )}{" "}
              {chainLabels[chain].symbol}
            </p>
          </div>
          <div className="flex justify-between gap-2">
            <p>Fee USD</p>
            <p>${fixed(value(app, "totalDAFeesUSD"), 2)}</p>
          </div>
        </div>;
      })}
    </div>
  );
}

export function Chart({
  values,
  labels = [],
  label,
  unit,
  kind = "bar",
}: {
  values: unknown[];
  labels?: string[];
  label: string;
  unit?: string;
  kind?: "bar" | "line";
}) {
  return (
    <DaClientChart
      values={values.map(numeric)}
      labels={labels}
      label={label}
      unit={unit}
      kind={kind}
    />
  );
}

export function ChartPair({
  chain,
  days,
  prices,
}: {
  chain: DaChain;
  days: DaNode[];
  prices: DaNode[];
}) {
  const dayValues = days.slice().reverse();
  const priceValues = prices.slice().reverse();
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:h-[20em]">
      <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
        <Chart
          label="Byte Size"
          unit={`${bytes(dayValues.reduce((sum, day) => sum + numeric(day.totalByteSize), 0))} [30 days]`}
          values={dayValues.map((day) => day.totalByteSize)}
          labels={dayValues.map((day) => formatDate(day.timestampLast))}
        />
      </div>
      <div className="h-[20em] rounded-lg bg-base-200/15 p-5">
        <Chart
          label={`${chainLabels[chain].symbol} Price`}
          unit="daily average"
          values={priceValues.map(
            (day) =>
              day[chain === "celestia" ? "avgNativePrice" : "avgAvailPrice"],
          )}
          labels={priceValues.map((day) => formatDate(day.timestampLast))}
          kind="line"
        />
      </div>
    </div>
  );
}

export function StatsPanel({
  chain,
  days,
}: {
  chain: DaChain;
  days: DaNode[];
}) {
  const ordered = days.slice().reverse();
  return (
    <div className="border border-base-200 bg-base-100">
      <div className="flex justify-between border-b border-base-200 p-5">
        <p>{chain === "celestia" ? "Celestia" : "Avail"} Stats</p>
        <div className="flex gap-2">
          <Link className="btn btn-sm" href={`/${chain}/stats/7d`}>
            7d
          </Link>
          <Link className="btn btn-sm" href={`/${chain}/stats/30d`}>
            30d
          </Link>
          <Link className="btn btn-sm" href={`/${chain}/stats/90d`}>
            90d
          </Link>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 lg:h-[20em]">
        <div className="h-[20em] border-r border-base-200 p-5">
          <Chart
            label="Byte Size"
            unit="daily"
            values={ordered.map((day) => day.totalByteSize)}
            labels={ordered.map((day) => formatDate(day.timestampLast))}
          />
        </div>
        <div className="h-[20em] p-5">
          <Chart
            label="DA Submissions"
            unit="daily"
            values={ordered.map((day) => day.totalDataSubmissionCount)}
            labels={ordered.map((day) => formatDate(day.timestampLast))}
          />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 lg:h-[20em]">
        <div className="h-[20em] border-r border-base-200 p-5">
          <Chart
            label="DA Fees"
            unit="USD"
            values={ordered.map((day) => day.totalDAFeesUSD)}
            labels={ordered.map((day) => formatDate(day.timestampLast))}
          />
        </div>
        <div className="h-[20em] p-5">
          <Chart
            label={chain === "celestia" ? "Transactions" : "Extrinsics"}
            unit="daily"
            values={ordered.map(
              (day) =>
                day[
                  chain === "celestia" ? "totalTxnCount" : "totalExtrinsicCount"
                ],
            )}
            labels={ordered.map((day) => formatDate(day.timestampLast))}
          />
        </div>
      </div>
    </div>
  );
}

export function UtilisationCard({
  chain,
  blocks,
}: {
  chain: DaChain;
  blocks: DaNode[];
}) {
  const count = blocks.length || 1;
  const totalSize = blocks.reduce(
    (sum, block) => sum + numeric(block.totalBlobSize ?? block.byteSize),
    0,
  );
  const totalActivity = blocks.reduce(
    (sum, block) =>
      sum + numeric(block.totalBlobTransactionCount ?? block.nbExtrinsics),
    0,
  );
  const averageSize = totalSize / count;
  const percent = Math.min(
    100,
    (averageSize / (chain === "celestia" ? 1024 * 1024 : 1024 * 1024)) * 100,
  );
  return (
    <div className="w-full rounded-lg border border-base-200 p-1">
      <div className="rounded-lg bg-base-100">
        <p className="w-full border-b border-base-200 p-3 text-xs">
          Space Utilization [Last {blocks.length || 100} Blocks]
        </p>
        <div className="grid h-full lg:grid-cols-2 lg:h-[17em]">
          <div className="flex h-[17em] flex-col justify-center p-5">
            <div
              className="radial-progress text-primary"
              style={{ "--value": percent } as CSSProperties}
              role="progressbar"
            >
              {percent.toFixed(2)}%
            </div>
            <p className="mt-3 text-center text-xs opacity-60">
              Average data per block
            </p>
          </div>
          <div className="grid h-[15em] grid-cols-2 border-t border-base-200 lg:h-full lg:border-l lg:border-t-0">
            <div className="flex flex-col items-center justify-center border-b border-base-200">
              <p className="opacity-70">Block Height</p>
              <p className="text-2xl font-bold">
                {short(value(blocks[0], "id"), 12, 0)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-b border-l border-base-200">
              <p className="opacity-70">Space Utilization</p>
              <p className="text-2xl font-bold">{percent.toFixed(2)}%</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="opacity-70">Avg. Size/Block</p>
              <p className="text-2xl font-bold">{bytes(averageSize)}</p>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-base-200">
              <p className="opacity-70">
                Avg. {chain === "celestia" ? "DA Tx" : "subs"}/Block
              </p>
              <p className="text-2xl font-bold">
                {(totalActivity / count).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RowIcon({
  kind,
  chain,
  imageSrc,
}: {
  kind: "app" | "account" | "block" | "transaction";
  chain?: DaChain;
  imageSrc?: string;
}) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-200/50"
      aria-hidden
    >
      {(kind === "app" || kind === "account") && chain ? (
        <ImageWithFallback
          src={
            imageSrc ||
            `https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${chain}.png?raw=true`
          }
          fallback={chainLabels[chain].icon}
          className="rounded-lg"
          width={24}
          height={24}
          alt=""
        />
      ) : kind === "account" ? (
        <User strokeWidth={1} width={24} height={24} />
      ) : kind === "transaction" ? (
        <NotepadText strokeWidth={1} width={24} height={24} />
      ) : (
        <Box strokeWidth={1} width={24} height={24} />
      )}
    </div>
  );
}

export function DataTable({
  chain,
  rows,
  kind,
  pagination,
}: {
  chain: DaChain;
  rows: DaNode[];
  kind: "apps" | "accounts" | "blocks";
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    basePath: string;
    paramName?: string;
  };
}) {
  const isApp = kind === "apps";
  const isAccount = kind === "accounts";
  const activityKey =
    isApp || isAccount
      ? chain === "celestia"
        ? "totalTxnCount"
        : "totalExtrinsicCount"
      : chain === "celestia"
        ? "totalTransactionCount"
        : "nbExtrinsics";
  const name = isApp ? "App" : isAccount ? "Address" : "Block";
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div
        className={`hidden py-4 px-4 text-sm items-center border-b border-base-200 xl:grid ${isApp || isAccount ? "xl:grid-cols-6" : "xl:grid-cols-7"}`}
      >
        <div className="col-span-2">{name}</div>
        <p>Size</p>
        <p>Data Subs</p>
        <p>
          {isApp
            ? chain === "celestia"
              ? "Transactions"
              : "Extrinsics"
            : isAccount
              ? chain === "celestia"
                ? "Transactions"
                : "Extrinsics"
              : chain === "celestia"
                ? "Txns"
                : "Ext"}
        </p>
        <p>{isAccount || isApp ? "Fees" : "Events"}</p>
        {!isAccount && !isApp ? <p>Fees</p> : null}
      </div>
      <div className="px-4">
        {rows.map((row, index) => {
          const rawId = value(row, "id");
          const id =
            isAccount && chain === "celestia"
              ? parseCelestiaString(rawId)
              : rawId;
          const appDetails = isApp ? getAppDetailsFromAppBook(rawId) : null;
          const accountDetails = isAccount
            ? getAccountDetailsFromAddressBook(id.toLowerCase())
            : null;
          const display = isApp
            ? appDetails?.name ||
              (value(row, "name") !== "—"
                ? formatWrapedText(value(row, "name"), 6, 9)
                : id)
            : isAccount
              ? accountDetails?.name || formatOriginalAddress(id)
              : id;
          const href = isApp
            ? `/${chain}/apps/${encodeURIComponent(id)}`
            : isAccount
              ? `/${chain}/${encodeURIComponent(id)}`
              : `/${chain}/blocks/${encodeURIComponent(id)}`;
          const size = value(row, "totalByteSize");
          const submissions = value(row, "totalDataSubmissionCount");
          const activity = value(row, activityKey);
          const fee = isApp
            ? value(
                row,
                chain === "celestia" ? "totalFeesNative" : "totalFeesAvail",
              )
            : isAccount
              ? value(row, "totalFees")
              : value(
                  row,
                  chain === "celestia" ? "totalBlockFeeNatve" : "blockFee",
                );
          return (
            <div
              key={`${id}-${index}`}
              className="border-b border-base-200 py-4 text-sm last:border-b-0"
            >
              <div
                className={`hidden items-center xl:grid ${isApp || isAccount ? "xl:grid-cols-6" : "xl:grid-cols-7"}`}
              >
                <div className="col-span-2 flex items-center gap-2">
                  <RowIcon
                    kind={isApp ? "app" : isAccount ? "account" : "block"}
                    chain={chain}
                    imageSrc={appDetails?.logoUri || accountDetails?.logoUri}
                  />
                  <div>
                    <Link className="text-primary" href={href}>
                      {display}
                    </Link>
                    {!isApp && !isAccount ? (
                      <p className="opacity-70">
                        {timeAgo(value(row, "timestamp"))}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p>{bytes(size)}</p>
                <p>{compact(submissions)}</p>
                <p>{compact(activity)}</p>
                {isApp || isAccount ? (
                  <div>
                    <p>
                      {fixed(fee, 4)} {chainLabels[chain].symbol}
                    </p>
                    <p>${fixed(value(row, "totalFeesUSD"), 2)}</p>
                  </div>
                ) : (
                  <>
                    <p>
                      {compact(
                        value(row, "totalEventsCount") !== "—"
                          ? value(row, "totalEventsCount")
                          : value(row, "nbEvents"),
                      )}
                    </p>
                    <p>
                      {fixed(fee, 4)} {chainLabels[chain].symbol}
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap justify-between gap-2 xl:hidden">
                <div className="flex items-center gap-2">
                  <RowIcon
                    kind={isApp ? "app" : isAccount ? "account" : "block"}
                    chain={chain}
                    imageSrc={appDetails?.logoUri || accountDetails?.logoUri}
                  />
                  <div>
                    <Link className="text-primary" href={href}>
                      {display}
                    </Link>
                    {!isApp && !isAccount ? (
                      <p className="opacity-70">
                        {timeAgo(value(row, "timestamp"))}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <p>{bytes(size)}</p>
                  {!isApp && !isAccount ? (
                    <p>
                      {fixed(fee, 4)} {chainLabels[chain].symbol}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!rows.length ? (
        <p className="p-6 text-center opacity-60">No records found.</p>
      ) : null}
      {pagination && pagination.totalCount > pagination.pageSize ? (
        <ServerPagination {...pagination} />
      ) : null}
    </div>
  );
}

function activitySum(row: DaNode, key: string): unknown {
  const submissions = row.dataSubmissions as DaNode | undefined;
  const aggregates = submissions?.aggregates as DaNode | undefined;
  const sum = aggregates?.sum as DaNode | undefined;
  return sum?.[key] ?? 0;
}

export function ActivityTable({
  chain,
  rows,
  pagination,
}: {
  chain: DaChain;
  rows: DaNode[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    basePath: string;
    paramName?: string;
  };
}) {
  const isAvail = chain === "avail";
  const symbol = chainLabels[chain].symbol;
  return (
    <div className="rounded-lg border border-base-200 bg-base-100">
      <div className="border-b border-base-200 p-4">
        {isAvail ? "Extrinsics" : "Transactions"}
      </div>
      <div className="hidden items-center border-b border-base-200 p-4 text-end text-sm xl:grid xl:grid-cols-7">
        <div className="text-start">{isAvail ? "Ext #" : "Txn #"}</div>
        <p>From</p>
        <p>{isAvail ? "Module" : "Events"}</p>
        <p>DA size</p>
        <p>Position</p>
        <p>Txn fee</p>
        <p>DA fee</p>
      </div>
      <div className="px-4">
        {rows.map((row, index) => {
          const rawHash = value(row, isAvail ? "id" : "hash");
          const hash = rawHash.replace(/^\\x/i, "0x");
          const rawSigner = value(row, isAvail ? "signer" : "signerId");
          const signer = isAvail ? rawSigner : parseCelestiaString(rawSigner);
          const size = isAvail
            ? activitySum(row, "byteSize")
            : value(row, "totalBytes");
          const txnFee = value(row, isAvail ? "fees" : "txFeeNative");
          const daFee = isAvail
            ? activitySum(row, "fees")
            : numeric(size) > 0
              ? txnFee
              : 0;
          const position = isAvail
            ? `${value(row, "blockHeight")} : ${value(row, "extrinsicIndex")}`
            : value(row, "blockHeightId");
          return (
            <div
              className="border-b border-base-200 py-4 text-sm last:border-b-0"
              key={`${hash}-${index}`}
            >
              <div className="hidden items-center text-end xl:grid xl:grid-cols-7">
                <div className="flex items-center gap-2 text-start">
                  <RowIcon kind="transaction" />
                  <div className="min-w-0">
                    <Link
                      className="text-primary"
                      href={`/${chain}/txn/${encodeURIComponent(hash)}`}
                    >
                      {short(hash)}
                    </Link>
                    <p>{timeAgo(value(row, "timestamp"))}</p>
                  </div>
                </div>
                <p title={signer}>{formatOriginalAddress(signer)}</p>
                {isAvail ? (
                  <div className="flex justify-end">
                    <p className="-mr-2 w-fit rounded-full border border-base-200 p-1 px-2">
                      {value(row, "module")}
                    </p>
                  </div>
                ) : (
                  <p>{compact(value(row, "nEvents"))}</p>
                )}
                <p>{bytes(size)}</p>
                <p>{position}</p>
                <p>{fixed(txnFee, 5)} {symbol}</p>
                <p>{fixed(daFee, 5)} {symbol}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 xl:hidden">
                <div className="flex min-w-0 items-center gap-2">
                  <RowIcon kind="transaction" />
                  <div className="min-w-0">
                    <Link
                      className="text-primary"
                      href={`/${chain}/txn/${encodeURIComponent(hash)}`}
                    >
                      {short(hash)}
                    </Link>
                    <p>{timeAgo(value(row, "timestamp"))}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p>{bytes(size)}</p>
                  <p>{fixed(txnFee, 5)} {symbol}</p>
                </div>
                <div className="flex w-full justify-between md:hidden">
                  <p>From: {formatOriginalAddress(signer)}</p>
                  <p>{position}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!rows.length ? (
        <p className="p-6 text-center opacity-60">No records found.</p>
      ) : null}
      <ServerPagination {...pagination} />
    </div>
  );
}

export function SearchResults({
  chain,
  results,
}: {
  chain: DaChain;
  results: { accounts: DaNode[]; apps: DaNode[] };
}) {
  if (!results.accounts.length && !results.apps.length)
    return (
      <div className="rounded-lg border border-base-200 bg-base-100 p-5 opacity-70">
        No search matches.
      </div>
    );
  return (
    <div className="rounded-lg border border-base-200 bg-base-100 p-5">
      <h2 className="mb-4 font-semibold">Search results</h2>
      <div className="flex flex-wrap gap-3">
        {results.accounts.map((account) => (
          <Link
            className="badge badge-outline p-4 text-primary"
            key={value(account, "id")}
            href={`/${chain}/${encodeURIComponent(value(account, "id"))}`}
          >
            <User width={16} height={16} /> {short(value(account, "id"))}
          </Link>
        ))}
        {results.apps.map((app) => (
          <Link
            className="badge badge-outline p-4 text-primary"
            key={value(app, "id")}
            href={`/${chain}/apps/${encodeURIComponent(value(app, "id"))}`}
          >
            <NotepadText width={16} height={16} />{" "}
            {value(app, "name") !== "—"
              ? value(app, "name")
              : short(value(app, "id"))}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DetailCard({
  chain,
  title,
  data,
}: {
  chain: DaChain;
  title: string;
  data: DaNode | null;
}) {
  if (!data)
    return (
      <div className="rounded-lg border border-base-200 bg-base-100 p-8 text-center">
        No {title.toLowerCase()} data is available.
      </div>
    );
  const isApp = title.toLowerCase().includes("app");
  const isAccount = title.toLowerCase().includes("account");
  const isTransaction = title.toLowerCase().includes("transaction");
  const isEntity = isApp || isAccount;
  const entityId = value(data, "id");
  const mapped = isApp
    ? getAppDetailsFromAppBook(entityId)
    : getAccountDetailsFromAddressBook(entityId.toLowerCase());
  const entityName = mapped?.name || value(data, "name") || entityId;
  const activityKey =
    chain === "celestia" ? "totalTxnCount" : "totalExtrinsicCount";
  const feeKey = chain === "celestia" ? "totalFeesNative" : "totalDAFees";
  const feeValue =
    value(data, feeKey) !== "—"
      ? value(data, feeKey)
      : value(data, chain === "celestia" ? "totalFees" : "totalFeesAvail");
  const entries = Object.entries(data)
    .filter(([, item]) => typeof item !== "object" || item === null)
    .slice(0, 20);
  if (isEntity) {
    const rows = [
      {
        label: chain === "celestia" ? "Transactions" : "Extrinsic Count",
        icon: <NotepadText />,
        value: compact(value(data, activityKey)),
      },
      {
        label: "DA size",
        icon: <Database />,
        value: bytes(value(data, "totalByteSize")),
      },
      {
        label: "Total DA subs",
        icon: <HardDriveUpload />,
        value: compact(value(data, "totalDataSubmissionCount")),
      },
      {
        label: "DA Fees",
        icon: (
          <ImageWithFallback
            src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${chain}.png?raw=true`}
            fallback={chainLabels[chain].icon}
            width={24}
            height={24}
            alt={chainLabels[chain].symbol}
          />
        ),
        value: `${fixed(feeValue, 4)} ${chainLabels[chain].symbol}`,
      },
      {
        label: "DA Fees (USD)",
        icon: <Receipt />,
        value: `$${fixed(value(data, "totalDAFeesUSD"), 4)}`,
      },
    ];
    return (
      <div className="rounded-lg border border-base-300/30 bg-base-100/80">
        <div className="flex h-[4em] items-center gap-2 border-b border-base-200/50 p-4">
          <ImageWithFallback
            src={
              mapped?.logoUri ||
              `https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${chain}.png?raw=true`
            }
            fallback={chainLabels[chain].icon}
            width={24}
            height={24}
            alt=""
            className="rounded-lg"
          />
          <p>{entityName}</p>
        </div>
        <div className="grid lg:grid-cols-2">
          <div className="border-x-base-200/50 lg:border-r">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between p-4 py-3"
              >
                <div className="flex items-center gap-2">
                  {row.icon}
                  <p>{row.label}</p>
                </div>
                <p className="text-xl font-bold">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-base-200 bg-base-100 p-5">
        <div className="flex items-center gap-3">
          <RowIcon kind={isTransaction ? "transaction" : "block"} />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="break-all text-sm opacity-60">{value(data, "id")}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-base-200 bg-base-100">
        <dl className="grid gap-0 sm:grid-cols-2">
          {entries.map(([key, item]) => (
            <div className="border-b border-base-200 p-4" key={key}>
              <dt className="text-sm opacity-60">{key}</dt>
              <dd className="mt-1 break-words">{String(item ?? "—")}</dd>
            </div>
          ))}
        </dl>
        <div className="p-5">
          <Link className="text-primary underline" href={`/${chain}`}>
            Back to {chainLabels[chain].name}
          </Link>
        </div>
      </div>
    </div>
  );
}
