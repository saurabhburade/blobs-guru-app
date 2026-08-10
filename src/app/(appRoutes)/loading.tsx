import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChartLoading from "@/components/Skeletons/ChartLoading";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";

export default function Loading() {
  return (
    <div className="grid h-screen gap-0 xl:grid-cols-[1.25fr_5fr]">
      <div className="hidden xl:block">
        <Sidebar />
      </div>
      <div className="block xl:hidden">
        <Header />
      </div>
      <main
        className="flex h-screen min-h-[90vh] min-w-0 flex-col space-y-4 overflow-hidden p-5 pb-10"
        aria-busy="true"
        aria-label="Loading page"
      >
        <div className="my-[5em] w-full space-y-4 lg:my-0">
          <div className="grid gap-4 lg:h-[20em] lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={`loading-chart-${index}`}
                className="h-[20em] rounded-lg bg-base-200/15 p-5"
              >
                <ChartLoading />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-base-200/15 p-5">
            {Array.from({ length: 5 }, (_, index) => (
              <TransactionRowSkeleton key={`loading-row-${index}`} />
            ))}
          </div>
        </div>
        <span className="sr-only" role="status">
          Loading page
        </span>
      </main>
    </div>
  );
}
