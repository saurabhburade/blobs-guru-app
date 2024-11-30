import * as eigenDA from "./eigenDA";
import * as celestiaDA from "./celestia";
import * as espressoDA from "./espressoDA";
import * as meeDA from "./meeda";
import * as nearDA from "./near";
console.log(`🚀 ~ file: list.ts:6 ~ nearDA:`, nearDA);

export const getDARAW = () => {
  const DA_RAW_URLS = [
    eigenDA.rawData,
    celestiaDA?.rawData,
    espressoDA?.rawData,
    meeDA?.rawData,
    nearDA?.rawData,
  ];
  return DA_RAW_URLS;
};
