import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
const subgraphUrl =
  "https://api.studio.thegraph.com/query/90545/blobs-explorer/vt1.5(np)";
// const httpLink = new HttpLink({ uri: subgraphUrl });
export const apolloClient = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
});
