import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
const subgraphUrl =
  "https://api.studio.thegraph.com/query/90545/blobs-explorer/v0.0.73";
// const httpLink = new HttpLink({ uri: subgraphUrl });
export const apolloClient = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
});
