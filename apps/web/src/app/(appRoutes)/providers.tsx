"use client";

import { type PropsWithChildren } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo/client";
import { wagmiconfig } from "@/configs/constants";
import { WagmiProvider } from "wagmi";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ApolloProvider client={apolloClient}>
      <WagmiProvider config={wagmiconfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  );
};
