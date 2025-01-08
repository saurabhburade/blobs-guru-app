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
      totalBlobGasUSD
    }
  }
`;
export const BLOB_DAY_DATAS_QUERY = gql`
  query BlobsDayDatas($duration: Int) {
    blobsDayDatas(
      first: $duration
      orderBy: dayStartTimestamp
      orderDirection: desc
    ) {
      totalBlobTransactionCount
      dayStartTimestamp
      totalBlobGas
      totalBlobAccounts
      totalBlobHashesCount
      totalBlobGasEth
      totalFeeEth
      totalBlobBlocks
      avgEthPrice
      totalBlobGasUSD
    }
  }
`;
export const BLOB_HOUR_DATAS_QUERY = gql`
  query BlobsHourDatas($duration: Int) {
    blobsHourDatas(
      first: $duration
      orderBy: hourStartTimestamp
      orderDirection: desc
    ) {
      totalBlobTransactionCount
      hourStartTimestamp
      totalBlobGas
      totalBlobAccounts
      totalBlobHashesCount
      totalBlobGasEth
      totalFeeEth
      totalBlobBlocks
      avgEthPrice
      totalBlobGasUSD
    }
  }
`;
export const ETH_PRICE_DAY_DATAS_QUERY = gql`
  query BlobsDayDatas($duration: Int) {
    blobsDayDatas(
      first: $duration
      orderBy: dayStartTimestamp
      orderDirection: desc
    ) {
      avgEthPrice
      dayStartTimestamp
      totalBlobHashesCount
      totalBlobGas
      totalBlobGasUSD
    }
  }
`;

export const TOP_BLOB_ACCOUNTS_QUERY = gql`
  query {
    accounts(
      first: 15
      orderBy: totalBlobTransactionCount
      orderDirection: desc
      where: { type: 1 }
    ) {
      id
      totalBlobTransactionCount
      totalBlobGas
      lastUpdatedBlock
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
      totalBlobBlocks
      totalBlobGasUSD
    }
  }
`;
export const TOP_BLOB_ACCOUNTS_BLOCK_PAGE_QUERY = gql`
  query {
    accounts(
      first: 10
      orderBy: totalBlobBlocks
      orderDirection: desc
      where: { type: 1 }
    ) {
      id
      totalBlobTransactionCount
      totalBlobGas
      lastUpdatedBlock
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
      totalBlobBlocks
    }
  }
`;
export const TOP_FIVE_BLOB_ACCOUNTS_QUERY = gql`
  query {
    accounts(
      first: 4
      orderBy: totalBlobGas
      orderDirection: desc
      where: { type: 1 }
    ) {
      id

      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
      totalBlobGasUSD
      lastUpdatedBlock
    }
  }
`;
export const ACCOUNT_DAY_DATAS_QUERY = gql`
  query AccountDayDatas($address: String) {
    accountDayDatas(
      skip: 1
      first: 15
      orderBy: dayStartTimestamp
      orderDirection: desc
      where: { account: $address }
    ) {
      id
      totalBlobTransactionCount
      dayStartTimestamp
      totalBlobTransactionCount
      totalBlobGas
      totalGasEth
      totalBlobHashesCount
      totalBlobBlocks
      totalBlobGasEth
      account {
        id
      }
    }
  }
`;
export const ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AccountDayDatas($address: String, $duration: Int) {
    accountDayDatas(
      first: $duration
      orderBy: dayStartTimestamp
      orderDirection: desc
      where: { account: $address }
    ) {
      id
      totalBlobTransactionCount
      dayStartTimestamp
      totalBlobTransactionCount
      totalBlobGas
      totalGasEth
      totalBlobHashesCount
      totalBlobBlocks
      totalBlobGasEth
      totalBlobGasUSD
      account {
        id
      }
    }
  }
`;
export const ACCOUNT_HOUR_DATAS_WITH_DURATION_QUERY = gql`
  query AccountHourDatas($address: String, $duration: Int) {
    accountHourDatas(
      first: $duration
      orderBy: hourStartTimestamp
      orderDirection: desc
      where: { account: $address }
    ) {
      id
      totalBlobTransactionCount
      hourStartTimestamp
      totalBlobTransactionCount
      totalBlobGas
      totalGasEth
      totalBlobHashesCount
      totalBlobBlocks
      totalBlobGasEth
      totalBlobGasUSD
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
      where: { type: 1 }
    ) {
      id
      totalBlobTransactionCount

      totalBlobGas
    }
  }
`;
export const SUPERCHAIN_BLOB_ACCOUNTS_QUERY = gql`
  query Accounts($addresses: [String!]) {
    accounts(where: { id_in: $addresses }) {
      id
      totalBlobTransactionCount
      totalBlobGas
      lastUpdatedBlock
      totalBlobGasEth
      totalBlobHashesCount
      totalFeeEth
      totalBlobBlocks
      totalBlobGasUSD
    }
  }
`;
export const BLOB_TRANSACTIONS_TOP_QUERY = gql`
  query {
    blobTransactions(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      from
      to
      blobHashesLength
      nonce
      gasPrice
      gasUsed
      blobGasEth
      blobGas
      timestamp
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
export const BLOB_BLOCKS_EXPLORER_QUERY_BLOCKS_PAGE = gql`
  query BlobBlockDatas($skip: Int, $limit: Int) {
    blobBlockDatas(
      first: $limit
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      blockNumber
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
      orderBy: timestamp
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
      timestamp
      blockNumber
      index
    }
  }
`;
export const BLOB_TRANSACTIONS_EXPLORER_QUERY = gql`
  query BlobTransactions($skip: Int, $limit: Int) {
    blobTransactions(
      first: $limit
      skip: $skip
      orderBy: timestamp
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
      timestamp
      blockNumber
      index
    }
  }
`;
export const BLOB_TRANSACTIONS_ACCOUNT_QUERY = gql`
  query BlobTransactions($skip: Int, $limit: Int, $account: String) {
    blobTransactions(
      first: $limit
      skip: $skip
      orderBy: timestamp
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
      timestamp
      blockNumber
      index
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
      where: { type: 1 }
    ) {
      id
      totalBlobGas
      lastUpdatedBlock
      totalBlobTransactionCount
      totalBlobGasEth
      totalBlobGasUSD
      totalBlobHashesCount
      totalFeeEth
      totalBlobBlocks
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
      totalBlobGasUSD
    }
  }
`;
export const BLOB_TRANSACTIONS_DA_COST_QUERY = gql`
  query BlobTransactions($limit: Int) {
    blobTransactions(
      first: $limit
      orderBy: blockNumber
      orderDirection: desc
    ) {
      blobHashesLength
      blobGasEth
      blobGasUSD
      timestamp
      blobGas
      blockNumber
    }
  }
`;
