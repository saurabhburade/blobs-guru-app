import type { Metadata } from "next";

import "react-tooltip/dist/react-tooltip.css";
import "../globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Ethereum Blobs Explorer: Analyze L2 Transactions & EIP-4844 Data",
  description:
    "Unlock the potential of Ethereum blobs. Analyze Layer 2 blob transactions and EIP-4844 data for improved scalability and efficiency.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />

        <link
          rel="icon"
          type="image/svg+xml"
          href="https://blobs.guru/favicon.svg?v=2"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Blobs Guru" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blobs.guru/" />
        {/* <meta
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
        /> */}
      </head>
      <body>
        <ThemeProvider enableSystem={false} defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
