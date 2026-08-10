"use client";

import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import { Box } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export type SummaryBlockRow = {
  id: string;
  block: string;
  timestamp: string;
  size: string;
  blobTransactions: string;
  transactions: string;
  events: string;
  fees: string;
};

type Props = {
  rows: SummaryBlockRow[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export default function SummaryBlocksTableIsland({
  rows,
  page,
  pageSize,
  totalCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const changePage = (target: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("blocksPage", String(target));
    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className="rounded-lg border border-base-200 bg-base-100"
      aria-busy={isPending}
    >
      <div className="hidden items-center border-b border-base-200 px-4 py-4 text-sm xl:grid xl:grid-cols-7">
        <div className="col-span-2">Block</div>
        <p>Size</p>
        <p>Blob Txn</p>
        <p>Txns</p>
        <p>Events</p>
        <p>Fees</p>
      </div>
      <div className="px-4">
        {isPending
          ? Array.from({ length: pageSize }, (_, index) => (
              <TransactionRowSkeleton key={`block-row-skeleton-${index}`} />
            ))
          : rows.map((row) => (
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
                        {row.block}
                      </Link>
                      <p>{row.timestamp}</p>
                    </div>
                  </div>
                  <p>{row.size}</p>
                  <p>{row.blobTransactions}</p>
                  <p>{row.transactions}</p>
                  <p>{row.events}</p>
                  <p>{row.fees}</p>
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
                        {row.block}
                      </Link>
                      <p>{row.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p>{row.size}</p>
                    <p>{row.fees}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>
      {totalCount > pageSize ? (
        <div className="flex justify-end gap-2 border-t border-base-200 p-4 px-4">
          {page > 1 ? (
            <button
              className="btn btn-outline btn-sm"
              type="button"
              disabled={isPending}
              onClick={() => changePage(page - 1)}
            >
              Prev
            </button>
          ) : null}
          {page * pageSize < totalCount ? (
            <button
              className="btn btn-outline btn-sm"
              type="button"
              disabled={isPending}
              onClick={() => changePage(page + 1)}
            >
              Next
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
