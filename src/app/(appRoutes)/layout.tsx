import type { Metadata } from "next";

import "../globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "next-themes";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Ethereum Blobs Explorer: Analyze L2 Transactions & EIP-4844 Data",
  description:
    "Unlock the potential of Ethereum blobs. Analyze Layer 2 blob transactions and EIP-4844 data for improved scalability and efficiency.",
};
const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const GOOGLE_ANALYTICS_ID = "G-WZGPHNZWNN";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" href="/favicon.svg" />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Blobs Guru" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blobs.guru/" />
        <meta
          property="og:title"
          content="Ethereum Blobs Explorer: Analyze L2 Transactions & EIP-4844 Data"
        />
        <meta
          property="og:description"
          content="Unlock the potential of Ethereum blobs. Analyze Layer 2 blob transactions and EIP-4844 data for improved scalability and efficiency."
        />
        <meta property="og:image" content="https://blobs.guru/summary.jpeg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://blobs.guru/" />
        <meta
          property="twitter:title"
          content="Ethereum Blobs Explorer: Analyze L2 Transactions & EIP-4844 Data"
        />
        <meta
          property="twitter:description"
          content="Unlock the potential of Ethereum blobs. Analyze Layer 2 blob transactions and EIP-4844 data for improved scalability and efficiency."
        />
        <meta
          property="twitter:image"
          content="https://blobs.guru/summary.jpeg"
        />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className={space_grotesk.className}>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
