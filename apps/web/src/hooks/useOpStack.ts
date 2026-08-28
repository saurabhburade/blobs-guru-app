// @ts-nocheck
import { SUPERCHAIN_BLOB_ACCOUNTS_QUERY } from "@/lib/apollo/queries";
import { useQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import axios from "axios";
import _ from "lodash";

// Basic CSV to JSON conversion function
const csvToJson = (csv) => {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");

    if (currentLine.length === headers.length) {
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
      result.push(obj);
    }
  }

  return result;
};
export const useOpStackAccountsData = (opAccounts: any) => {
  const { data: resp, error: fetchCsvErr } = useReactQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await axios.get(
        "https://raw.githubusercontent.com/ethereum-optimism/op-analytics/refs/heads/main/op_chains_tracking/outputs/chain_metadata.csv"
      );
      return res.data;
    },
  });
  const jsonParsed = resp && csvToJson(resp);
  const addressesFiltered = jsonParsed?.filter(
    (s) =>
      s.is_op_chain === "True" &&
      s.da_layer === "ethereum" &&
      s.batchinbox_from?.trim() !== ""
  );
  const addresses = addressesFiltered?.map((s) =>
    (s.batchinbox_from as String).toLowerCase()
  );
  const addressesFallback = opAccounts.map((s) =>
    (s.batchinbox_from as String).toLowerCase()
  );

  const { data, loading, error } = useQuery(SUPERCHAIN_BLOB_ACCOUNTS_QUERY, {
    variables: {
      addresses: fetchCsvErr ? addressesFallback : addresses,
    },
    pollInterval: 60_000, // Every 60 sec
  });

  const collectiveData = {};

  for (let index = 0; index < data?.accounts?.length; index++) {
    const acc = data?.accounts[index];
    if (Object.keys(collectiveData).length <= 0) {
      collectiveData["totalBlobGas"] = 0;
      collectiveData["totalBlobTransactionCount"] = 0;
      collectiveData["lastUpdatedBlock"] = 0;
      collectiveData["totalBlobGasEth"] = 0;
      collectiveData["totalBlobHashesCount"] = 0;
      collectiveData["totalFeeEth"] = 0;
      collectiveData["totalBlobBlocks"] = 0;
      collectiveData["totalBlobGasUSD"] = 0;
    }
    collectiveData["totalBlobGas"] =
      collectiveData["totalBlobGas"] + Number(acc.totalBlobGas);
    collectiveData["totalBlobTransactionCount"] =
      (collectiveData["totalBlobTransactionCount"] || 0) +
      Number(acc.totalBlobTransactionCount);
    collectiveData["totalBlobGasEth"] =
      (collectiveData["totalBlobGasEth"] || 0) + Number(acc.totalBlobGasEth);
    collectiveData["totalBlobHashesCount"] =
      (collectiveData["totalBlobHashesCount"] || 0) +
      Number(acc.totalBlobHashesCount);
    collectiveData["totalFeeEth"] =
      (collectiveData["totalFeeEth"] || 0) + Number(acc.totalFeeEth);
    collectiveData["totalBlobBlocks"] =
      (collectiveData["totalBlobBlocks"] || 0) + Number(acc.totalBlobBlocks);
    collectiveData["totalBlobGasUSD"] =
      (collectiveData["totalBlobGasUSD"] || 0) + Number(acc.totalBlobGasUSD);
    collectiveData["lastUpdatedBlock"] = Number(acc.lastUpdatedBlock);
  }
  const mappedChains =
    data?.accounts?.length > 0
      ? opAccounts?.map((s) => {
          const foundResult = data?.accounts?.find(
            (r) => (s.batchinbox_from as String).toLowerCase() === r?.id
          );
          return {
            ...s,
            ...foundResult,
          };
        })
      : [];

  return {
    data: {
      collectiveData,
      mappedChains: _.orderBy(mappedChains, (s) => Number(s?.totalBlobGas), [
        "desc",
      ]),
    },
    loading,
    error,
  };
};
