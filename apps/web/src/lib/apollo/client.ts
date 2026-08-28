import { ApolloClient, InMemoryCache } from "@apollo/client";
import {
  AVAIL_SUBQUERY_URL,
  CELESTIA_SUBQUERY_URL,
  ETHEREUM_SUBQUERY_URL,
} from "@/configs/env";

export const apolloClient = new ApolloClient({
  uri: ETHEREUM_SUBQUERY_URL,
  cache: new InMemoryCache(),
});

export const availClient = new ApolloClient({
  uri: AVAIL_SUBQUERY_URL,
  cache: new InMemoryCache(),
});

export const celestiaClient = new ApolloClient({
  uri: CELESTIA_SUBQUERY_URL,
  cache: new InMemoryCache(),
});
