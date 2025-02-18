import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
const subgraphUrl =
  "https://api.studio.thegraph.com/query/90545/blobs-explorer/vt1.5(np)";
const availUrl = "https://lwmetal2.blobs.guru/";

export const apolloClient = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
});

export const availClient = new ApolloClient({
  uri: availUrl,
  cache: new InMemoryCache(),
});
