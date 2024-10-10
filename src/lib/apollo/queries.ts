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
      totalBlobAccounts
      totalBlobHashesCount
    }
  }
`;
export const TOP_BLOB_ACCOUNTS_QUERY = gql`
  query {
    accounts(
      first: 15
      orderBy: totalBlobTransactionCount
      orderDirection: desc
    ) {
      id
      totalBlobTransactionCount
      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
      totalFeeEth
      lastUpdatedBlock
      totalBlobGas
    }
  }
`;
export const TOP_FIVE_BLOB_ACCOUNTS_QUERY = gql`
  query {
    accounts(first: 4, orderBy: totalBlobHashesCount, orderDirection: desc) {
      id

      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth

      lastUpdatedBlock
      totalBlobGas
    }
  }
`;
export const ACCOUNT_DAY_DATAS_QUERY = gql`
  query AccountDayDatas($address: String) {
    accountDayDatas(first: 15, where: { account: $address }) {
      id
      totalBlobTransactionCount
      dayStartTimestamp
      totalBlobTransactionCount
      totalBlobGas
      totalGasEth
      totalBlobHashesCount
      totalBlobBlocks
      account {
        id
      }
    }
  }
`;
export const TOP_BLOB_ACCOUNTS_BY_HASHES_QUERY = gql`
  query {
    accounts(
      first: 15
      orderBy: totalBlobTransactionCount
      orderDirection: desc
    ) {
      id
      totalBlobTransactionCount

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
export const BLOB_TRANSACTIONS_ACCOUNT_QUERY = gql`
  query BlobTransactions($skip: Int, $limit: Int, $account: String) {
    blobTransactions(
      first: $limit
      skip: $skip
      orderBy: index
      orderDirection: desc
      where: { from: $account }
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

export const BLOB_ACCOUNTS_EXPLORER_QUERY = gql`
  query Accounts($skip: Int, $limit: Int) {
    accounts(
      first: $limit
      skip: $skip
      orderBy: totalBlobHashesCount
      orderDirection: desc
    ) {
      id
      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
    }
  }
`;
export const BLOB_ACCOUNT_SINGLE_QUERY = gql`
  query Account($address: ID) {
    account(id: $address) {
      id
      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
    }
  }
`;
