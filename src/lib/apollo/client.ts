import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
const subgraphUrl =
  "https://api.studio.thegraph.com/query/90545/blobs-explorer/vt1.5(np)";
const availUrl = "https://availsubquery2.blobs.guru/";
const availUrl2 = "https://availsubquery2.blobs.guru/";
// const availUrl2 = "https://availsubquery.blobs.guru/";
// const availUrl2 = "http://50.28.2.32:3000";
// const availUrl2 = "https://availwd.blobs.guru/"; //"http://92.113.144.195:3000";
// const availUrl2 = "http://69.167.167.199:3000";

// const httpLink = new HttpLink({ uri: subgraphUrl });
export const apolloClient = new ApolloClient({
  uri: subgraphUrl,
  cache: new InMemoryCache(),
});

export const availClient = new ApolloClient({
  uri: availUrl2,
  cache: new InMemoryCache(),
});
export const availClientV2 = new ApolloClient({
  uri: availUrl2,
  cache: new InMemoryCache(),
});
