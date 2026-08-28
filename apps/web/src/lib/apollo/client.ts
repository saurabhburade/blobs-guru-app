import { ApolloClient, InMemoryCache } from "@apollo/client";

const subgraphUrl = "https://ethapi.blobs.guru/";
const availUrl = "https://availapi.blobs.guru/";
const celestiaUrl = "https://celestiaapi.blobs.guru/";

export const apolloClient = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
});

export const availClient = new ApolloClient({
  uri: availUrl,
  cache: new InMemoryCache(),
});

export const celestiaClient = new ApolloClient({
  uri: celestiaUrl,
  cache: new InMemoryCache(),
});
