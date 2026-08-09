import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import ImageWithFallback from "@/components/ImageWithFallback";
import Sidebar from "@/components/Sidebar/Sidebar";
import PoweredBy from "@/views/Home/components/PoweredBy";
import Link from "next/link";

type SearchResults = {
  accounts: Array<{ id: string }>;
  apps: Array<{ id: string; name?: string }>;
};

type Props = {
  title: string;
  eyebrow?: string;
  active?: "summary" | "apps" | "stats";
  compactHeader?: boolean;
  searchQuery?: string;
  searchResults?: SearchResults;
  children: React.ReactNode;
};

export default function EthereumShell({
  title,
  eyebrow = "Ethereum Blobs",
  active,
  compactHeader = false,
  searchQuery,
  searchResults,
  children,
}: Props) {
  return (
    <div className="grid h-screen gap-0 xl:grid-cols-[1.25fr_5fr]">
      <div className="hidden xl:block">
        <Sidebar />
      </div>
      <div className="block xl:hidden">
        <Header />
      </div>
      <main className="flex h-screen min-h-[90vh] min-w-0 flex-col space-y-4 overflow-scroll p-5 pb-10">
        <div
          className={`mb-4 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center ${compactHeader ? "lg:my-0 my-[5em]" : "lg:my-0 my-[5em]"}`}
        >
          <div className="flex items-center gap-2">
            {!compactHeader ? (
              <ImageWithFallback
                src="https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/ethereum.png?raw=true"
                fallback="/images/ethereum_logo.png"
                className="rounded-lg"
                width={24}
                height={24}
                alt=""
              />
            ) : null}
            <div>
              {!compactHeader ? (
                <h1 className="text-2xl font-bold">{title}</h1>
              ) : (
                <h2 className="text-xl font-semibold">{title}</h2>
              )}
              {!compactHeader && eyebrow !== "Ethereum Blobs" ? (
                <p className="text-sm opacity-60">{eyebrow}</p>
              ) : null}
            </div>
          </div>
          <div className="flex w-full justify-end lg:w-1/2">
            {!compactHeader ? (
              <div className="w-full lg:w-2/3">
                <form
                  action="/ethereum/search"
                  method="get"
                  className="join w-full"
                >
                  <input
                    name="query"
                    defaultValue={searchQuery}
                    className="input join-item input-bordered w-full"
                    placeholder="Search Account / App"
                    maxLength={80}
                  />
                  <button
                    className="btn join-item rounded-r-full"
                    type="submit"
                  >
                    Search
                  </button>
                </form>
                {searchQuery && searchResults ? (
                  <div className="mt-2 rounded-box border border-base-200 bg-base-100 p-2 shadow">
                    {searchResults.accounts.map((account) => (
                      <Link
                        key={account.id}
                        href={`/ethereum/${account.id}`}
                        className="block p-2 hover:bg-base-200"
                      >
                        Account: {account.id}
                      </Link>
                    ))}
                    {searchResults.apps.map((app) => (
                      <Link
                        key={app.id}
                        href={`/ethereum/apps/${app.id}`}
                        className="block p-2 hover:bg-base-200"
                      >
                        Rollup: {app.name || app.id}
                      </Link>
                    ))}
                    {!searchResults.accounts.length &&
                    !searchResults.apps.length ? (
                      <p className="p-2 text-sm opacity-60">
                        No matching account or rollup.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {children}
        <PoweredBy />
        <Footer />
      </main>
    </div>
  );
}
