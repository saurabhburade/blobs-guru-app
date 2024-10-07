import { gql } from "@apollo/client";

export const COLLECTIVE_STAT_QUERY = gql`
  query {
    collectiveData(id: "1") {
      id
      totalBlobTransactionCount
      totalGasEth
      lastUpdatedBlock
      totalFeeEth
      totalBlobGasEth
      totalBlobHashesCount
      totalBlobBlocks
      totalBlobAccounts
      totalBlobGas
    }
  }
`;
export const BLOB_DAY_DATAS_QUERY = gql`
  query {
    blobsDayDatas(first: 10) {
      totalBlobTransactionCount
      dayStartTimestamp
    }
  }
`;
export const BLOB_TRANSACTIONS_TOP_QUERY = gql`
  query {
    blobTransactions(first: 10) {
      id
      from
      to
      blobHashesLength
      nonce
      gasPrice
      gasUsed
      blobGasEth
      blobGas
    }
  }
`;
export const BLOB_BLOCKS_TOP_QUERY = gql`
  query {
    blobBlockDatas(first: 10, orderBy: blockNumber, orderDirection: desc) {
      id
      blockNumber
      totalBlobTransactionCount
      totalTransactionCount
      totalFeeEth
      totalBlobGasEth
      totalBlobAccounts
      size
      timestamp
      totalBlobHashesCount
      totalBlobGas
    }
  }
`;
