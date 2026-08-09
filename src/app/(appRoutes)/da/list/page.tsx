import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getDARAW } from "@/lib/da/list";
import PoweredBy from "@/views/Home/components/PoweredBy";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Data Availability Providers | Blobs Guru",
  description:
    "Compare the security properties and bridges of data availability providers.",
};

type Sentiment = "good" | "bad" | "warning" | "neutral";

type Risk = {
  sentiment?: Sentiment;
  value?: string;
};

type ProviderPayload = {
  data?: {
    id?: string;
    kind?: string;
    display?: { name?: string; slug?: string };
    risks?: {
      economicSecurity?: Risk;
      fraudDetection?: Risk;
    };
    bridges?: Array<{
      id?: string;
      display?: { name?: string };
      risks?: {
        committeeSecurity?: Risk;
        upgradeability?: Risk;
        relayerFailure?: Risk;
      };
    }>;
  };
};

const fills: Record<Sentiment, string> = {
  good: "#4CAF50",
  bad: "#F44336",
  warning: "#FF9800",
  neutral: "gray",
};

function riskColor(risk?: Risk) {
  return fills[risk?.sentiment ?? "neutral"];
}

async function getProviders(): Promise<ProviderPayload[]> {
  const responses = await Promise.allSettled(
    getDARAW().map(async (url) => {
      const response = await fetch(url, {
        next: { revalidate },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new Error(`Provider request failed with ${response.status}`);
      }

      return (await response.json()) as ProviderPayload;
    }),
  );

  return responses.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}

export default async function DAListPage() {
  const providers = await getProviders();

  return (
    <div className="grid xl:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="xl:block hidden">
        <Sidebar />
      </div>
      <div className="xl:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10">
        <div className="w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">
            Data Availability Providers
          </h2>
        </div>

        <div className="border border-base-200 rounded-lg">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-b border-base-200 py-4 text-sm xl:grid">
            <p className="px-4">DA Layer</p>
            <p>Economic Security</p>
            <p>Fraud detection</p>
            <p>Bridge</p>
            <p>Committee security</p>
            <p>Upgradeability</p>
            <p>Relayer failure</p>
          </div>

          {providers.length === 0 ? (
            <p className="p-6 text-sm opacity-70">
              Provider data is temporarily unavailable. Please try again after
              the next refresh.
            </p>
          ) : (
            providers.map((provider, providerIndex) => {
              const data = provider.data;
              return (
                <article
                  className="grid w-full grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-b border-base-200 self-center font-semibold"
                  key={data?.id ?? providerIndex}
                >
                  <div className="col-span-2 flex gap-4 border-b border-base-200 p-4 lg:col-span-1 lg:border-b-0">
                    <img
                      src={`https://raw.githubusercontent.com/saurabhburade/l2beat/main/packages/frontend/static/icons/${data?.display?.slug ?? "ethereum"}.png?raw=true`}
                      alt=""
                      className="size-10 rounded-lg bg-white p-1"
                    />
                    <div>
                      <h2 className="font-bold">
                        {data?.display?.name ?? "Unknown provider"}
                      </h2>
                      <p className="text-sm font-normal opacity-50">
                        {data?.kind ?? "Data availability"}
                      </p>
                    </div>
                  </div>

                  <div className="px-2 py-4">
                    <p className="text-xs font-normal opacity-50 lg:hidden">
                      Economic security
                    </p>
                    <p
                      style={{
                        color: riskColor(data?.risks?.economicSecurity),
                      }}
                    >
                      {data?.risks?.economicSecurity?.value ?? "Unknown"}
                    </p>
                  </div>
                  <div className="px-2 py-4">
                    <p className="text-xs font-normal opacity-50 lg:hidden">
                      Fraud detection
                    </p>
                    <p
                      style={{ color: riskColor(data?.risks?.fraudDetection) }}
                    >
                      {data?.risks?.fraudDetection?.value ?? "Unknown"}
                    </p>
                  </div>

                  <div className="col-span-2 lg:col-span-4 w-full">
                    {(data?.bridges?.length ? data.bridges : [undefined]).map(
                      (bridge, bridgeIndex) => (
                        <div
                          className="grid min-h-20 grid-cols-2 border-b border-base-200 bg-base-200/40 p-2 last:border-b-0 lg:grid-cols-4"
                          key={bridge?.id ?? bridgeIndex}
                        >
                          <RiskCell
                            label="Bridge"
                            value={bridge?.display?.name}
                          />
                          <RiskCell
                            label="Committee security"
                            risk={bridge?.risks?.committeeSecurity}
                          />
                          <RiskCell
                            label="Upgradeability"
                            risk={bridge?.risks?.upgradeability}
                          />
                          <RiskCell
                            label="Relayer failure"
                            risk={bridge?.risks?.relayerFailure}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

function RiskCell({
  label,
  risk,
  value,
}: {
  label: string;
  risk?: Risk;
  value?: string;
}) {
  return (
    <div className="px-2 py-4">
      <p className="text-xs font-normal opacity-50 lg:hidden">{label}</p>
      <p style={risk ? { color: riskColor(risk) } : undefined}>
        {value ?? risk?.value ?? "None"}
      </p>
    </div>
  );
}
