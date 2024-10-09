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
    blobsDayDatas(first: 15) {
      totalBlobTransactionCount
      dayStartTimestamp
      totalBlobGas
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
export const BLOB_BLOCKS_TOP_FIVE_QUERY = gql`
  query {
    blobBlockDatas(first: 5, orderBy: blockNumber, orderDirection: desc) {
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

export const BLOB_BLOCKS_EXPLORER_QUERY = gql`
  query BlobBlockDatas($skip: Int, $limit: Int) {
    blobBlockDatas(
      first: $limit
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
    ) {
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
export const GET_BLOB_BLOCK = gql`
  query BlobBlockData($blockNumber: ID) {
    blobBlockData(id: $blockNumber) {
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
export const BLOB_TRANSACTIONS_FOR_BLOCK = gql`
  query BlobTransactions($blockNumber: ID, $skip: Int, $limit: Int) {
    blobTransactions(
      first: $limit
      skip: $skip
      orderBy: index
      orderDirection: desc
      where: { blockNumber: $blockNumber }
    ) {
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
export const BLOB_TRANSACTIONS_EXPLORER_QUERY = gql`
  query BlobTransactions($skip: Int, $limit: Int) {
    blobTransactions(
      first: $limit
      skip: $skip
      orderBy: index
      orderDirection: desc
    ) {
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
export const BLOB_TRANSACTION_QUERY = gql`
  query BlobTransaction($hash: ID!) {
    blobTransaction(id: $hash) {
      id
      from
      to
      blobHashesLength
      nonce
      gasPrice
      gasUsed
      blobGasEth
      blobGas
      blobHashes
    }
  }
`;
