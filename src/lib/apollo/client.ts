import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
const subgraphUrl =
  // "https://api.studio.thegraph.com/query/90545/blobs-explorer/vt1.5(np)";
  // "https://api.studio.thegraph.com/query/90545/blobs-explorer/vt1.6.24";
  "http://103.50.32.155:8000/subgraphs/name/blobs-explorer";
// const availUrl = "https://wd.blobs.guru/";
// const availUrl = "http://161.97.94.52:3000";
const availUrl = "https://availapi.blobs.guru/";
const celestiaUrl = "http://103.50.32.159:3000";

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
