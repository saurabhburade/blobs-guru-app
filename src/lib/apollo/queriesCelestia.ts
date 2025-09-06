import { gql } from "@apollo/client";

export const CELESTIA_COLLECTIVE_STAT_QUERY = gql`
  query {
    collectiveData {
      nodes {
        totalByteSize
        totalBlocksCount
        totalDataSubmissionCount
        totalFeesNative
        totalDAFees
        totalDAFeesUSD
        totalTxnCount
        avgNativePrice

        totalDataBlocksCount
        totalBlocksCount
        timestampLast
        lastPriceFeed {
          nativePrice
        }
        endBlock
      }
    }
  }
`;
export const CELESTIA_ACCOUNTS_LIMIT_QUERY = gql`
  query AccountEntities($skip: Int, $limit: Int) {
    accountEntities(
      orderBy: TOTAL_BYTE_SIZE_DESC
      first: $limit
      offset: $skip
      filter: { type: { equalTo: 0 } }
    ) {
      totalCount
      nodes {
        id
        totalByteSize
        totalFees
        totalTxnCount
        totalDAFees
        endBlock
        startBlock
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
      }
    }
  }
`;

export const CELESTIA_APP_ACCOUNTS_LIMIT_QUERY = gql`
  query AccountEntities($skip: Int, $limit: Int, $appId: String) {
    accountEntities(
      orderBy: TOTAL_BYTE_SIZE_DESC
      first: $limit
      offset: $skip
      filter: { id: { endsWith: $appId } }
    ) {
      totalCount
      nodes {
        id
        totalByteSize
        totalFees
        totalTxnCount
        totalDAFees
        endBlock
        startBlock
        totalDataSubmissionCount
        totalFeesUSD
        address
        totalDAFeesUSD
      }
    }
  }
`;
export const CELESTIA_APPS_LIMIT_QUERY = gql`
  query AppEntities($skip: Int, $limit: Int) {
    appEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) {
      totalCount
      nodes {
        id
        name
        totalByteSize
        totalFeesNative
        totalTxnCount
        totalDAFees
        endBlock
        startBlock
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
      }
    }
  }
`;
export const CELESTIA_APPS_QUERY = gql`
  query AppEntities {
    appEntities(orderBy: TOTAL_BYTE_SIZE_DESC) {
      totalCount
      nodes {
        id
        name
        totalByteSize
        totalFeesNative
        totalTxnCount
        totalDAFees
        endBlock
        startBlock
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
      }
    }
  }
`;
export const CELESTIA_SINGLE_APP_QUERY = gql`
  query AppEntity($appId: String!) {
    appEntity(id: $appId) {
      id
      name
      totalByteSize
      totalFeesNative
      totalTxnCount
      totalDAFees
      endBlock
      startBlock
      totalDataSubmissionCount
      totalFeesUSD
      totalDAFeesUSD
      appHourData(first: 24) {
        nodes {
          id
          timestampLast
          timestampStart
          totalByteSize
        }
      }
    }
  }
`;
export const CELESTIA_ACCOUNT_EXT_LIMIT_QUERY = gql`
  query Extrinsics($skip: Int, $limit: Int, $address: String!) {
    extrinsics(
      orderBy: TIMESTAMP_DESC
      first: $limit
      offset: $skip
      filter: { signer: { equalTo: $address } }
    ) {
      totalCount
      nodes {
        id
        signer
        fees
        argsName
        argsValue
        timestamp
        ethBlock
        nbEvents
        blockId
        txHash
        module
        fees
        feesRounded
        nativePrice
        blockHeight
        extrinsicIndex
      }
    }
  }
`;
export const CELESTIA_BLOCKS_LIMIT_QUERY = gql`
  query BlockData($skip: Int, $limit: Int) {
    blockData(orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) {
      totalCount
      aggregates {
        sum {
          totalBlobSize
          totalBlobTransactionCount
        }
      }
      nodes {
        timestamp
        id

        avgNativePrice
        totalBlobSize
        totalEventsCount
        totalBlobTransactionCount
        totalTransactionCount
        avgNativePrice
        currentNativePrice
        totalBlockFeeNatve
        totalBlockFeeUSD
      }
    }
  }
`;
export const CELESTIA_DA_EXT_FILTER_LIMIT_QUERY = gql`
  query DataSubmission($extrinsicIds: [String!]!) {
    dataSubmissions(filter: { extrinsicId: { in: $extrinsicIds } }) {
      nodes {
        byteSize
        id
        extrinsicId
        fees
        priceFeed {
          nativePrice
        }
      }
    }
  }
`;
export const CELESTIA_APP_DA_FILTER_LIMIT_QUERY = gql`
  query BlobData($namespaceID: String!, $skip: Int, $limit: Int) {
    blobData(
      filter: { namespaceID: { like: $namespaceID } }
      first: $limit
      offset: $skip
    ) {
      nodes {
        namespaceID
        shareVersion
        namespaceVersion
        commitment
        size
        signer
      }
    }
  }
`;
export const CELESTIA_APP_DA_TRANSACTIONS_FILTER_LIMIT_QUERY = gql`
  query TransactionData($namespaceID: String!, $skip: Int, $limit: Int) {
    transactionData(
      filter: { blobs: { some: { namespaceID: { like: $namespaceID } } } }
      first: $limit
      offset: $skip
    ) {
      nodes {
        hash
        timestamp
        txFeeNative
        blockHeightId
        nEvents
        id
        index
        txFeeUSD
        txFeeNative
        totalBytes
        signerId
        timestamp
        blobs {
          nodes {
            commitment
            signer
            size
          }
        }
      }
    }
  }
`;
export const CELESTIA_USER_TRANSACTIONS_FILTER_LIMIT_QUERY = gql`
  query TransactionData($signerId: String!, $skip: Int, $limit: Int) {
    transactionData(
      filter: { signerId: { equalTo: $signerId } }
      first: $limit
      offset: $skip
    ) {
      nodes {
        hash
        timestamp
        txFeeNative
        blockHeightId
        index
        nEvents
        id
        txFeeUSD
        txFeeNative
        totalBytes
        signerId
        timestamp
        blobs {
          nodes {
            commitment
            signer
            size
          }
        }
      }
    }
  }
`;
export const CELESTIA_ACCOUNT_SINGLE_QUERY = gql`
  query AccountEntity($id: String!) {
    accountEntities(
      filter: { id: { includes: $id }, attachedAppId: { isNull: true } }
      first: 1
    ) {
      nodes {
        id
        totalByteSize
        totalFees
        totalTxnCount
        totalDAFees
        endBlock
        startBlock
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
      }
    }
  }
`;
export const CELESTIA_ACCOUNT_SINGLE_QUERY_V2 = gql`
  query AccountEntity($id: String!) {
    accountEntity(id: $id) {
      id
      totalByteSize
      totalFees
      totalTxnCount
      totalDAFees
      endBlock
      startBlock
      totalDataSubmissionCount
      totalFeesUSD
      totalDAFeesUSD
      totalFeesNative
    }
  }
`;
export const CELESTIA_ACCOUNT_SEARCH = gql`
  query AccountEntities($address: String!) {
    accountEntities(filter: { address: { like: $address } }) {
      nodes {
        id
      }
    }
    appEntities(filter: { address: { like: $address } }) {
      nodes {
        id
      }
    }
  }
`;
export const CELESTIA_SEARCH = gql`
  query SearchEntities($query: String!) {
    accountEntities(
      filter: { address: { includesInsensitive: $query }, type: { equalTo: 0 } }
      first: 2
    ) {
      nodes {
        id
      }
    }
    appEntities(filter: { id: { includesInsensitive: $query } }) {
      nodes {
        id
        name
      }
    }
  }
`;
export const CELESTIA_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query CollectiveDayData($duration: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalTxnCount
        totalFees
        timestampLast
        timestampStart
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
        appDayDataParticipant(orderBy: TOTAL_BYTE_SIZE_DESC) {
          nodes {
            id
            appId
            app {
              name
            }
            totalByteSize
            totalTxnCount
            totalDataSubmissionCount
            totalFeesUSD
            totalDAFeesUSD
            totalFeesNative
          }
        }
      }
    }
  }
`;
export const CELESTIA_DAY_DATAS_WITH_DURATION_WITH_ACCOUNTS_QUERY = gql`
  query CollectiveDayData($duration: Int, $limit: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalFees
        timestampLast
        timestampStart
        accountDayDataParticipant: accountDayDataParticipant(
          first: $limit
          orderBy: TOTAL_TXN_COUNT_DESC
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          nodes {
            totalTxnCount
            accountId
          }
        }
        accountDayDataParticipantOthers: accountDayDataParticipant(
          orderBy: TOTAL_TXN_COUNT_DESC
          offset: $limit
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          aggregates {
            sum {
              totalTxnCount
            }
          }
        }
      }
    }
  }
`;
export const CELESTIA_DAY_DATAS_WITH_DURATION_WITH_APPS_QUERY = gql`
  query CollectiveDayData($duration: Int, $limit: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalFees
        timestampLast
        timestampStart
        totalByteSize
        totalTxnCount
        totalDAFees
        totalDAFeesUSD
        totalDataSubmissionCount
        appDayDataParticipant: appDayDataParticipant(
          first: $limit
          orderBy: TOTAL_TXN_COUNT_DESC
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          nodes {
            totalTxnCount
            totalByteSize
            appId
            totalDataSubmissionCount
            totalDAFees
            totalDAFeesUSD
          }
        }
        appDayDataParticipantOthers: appDayDataParticipant(
          orderBy: TOTAL_BYTE_SIZE_DESC
          offset: $limit
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          aggregates {
            sum {
              totalTxnCount
              totalByteSize
              totalDataSubmissionCount
              totalDAFees
              totalDAFeesUSD
            }
          }
        }
      }
    }
  }
`;
export const CELESTIA_HOUR_DATAS_WITH_DURATION_QUERY = gql`
  query CollectiveHourData($duration: Int) {
    collectiveHourData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalTxnCount
        totalFees
        timestampLast
        timestampStart
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
        appHourDataParticipant {
          nodes {
            id
            app {
              name
            }
            totalByteSize
          }
        }
      }
    }
  }
`;
export const CELESTIA_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AccountDayData($address: String, $duration: Int) {
    accountDayData(
      filter: { accountId: { equalTo: $address } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalTxnCount
        totalFees
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        accountId
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
      }
    }
  }
`;
export const CELESTIA_BALANCE_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AccountBalanceDayData($address: String, $duration: Int) {
    accountBalanceDayData(
      filter: { accountId: { equalTo: $address } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        timestampLast
        timestampStart
        accountId
        amountTotal
      }
    }
  }
`;
export const CELESTIA_APP_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AppDayData($appId: String, $duration: Int) {
    appDayData(
      filter: { appId: { equalTo: $appId } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalTxnCount
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
      }
    }
  }
`;
export const CELESTIA_ACCOUNT_HOUR_DATAS_WITH_DURATION_QUERY = gql`
  query AccountHourData($address: String, $duration: Int) {
    accountHourData(
      filter: { accountId: { equalTo: $address } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalTxnCount
        totalFees
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        accountId
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesNative
      }
    }
  }
`;
export const CELESTIA_BLOCKS_WITH_LIMIT_QUERY = gql`
  query Block($limit: Int) {
    blocks(first: $limit, orderBy: TIMESTAMP_DESC) {
      nodes {
        id
        timestamp
      }
    }
  }
`;
export const CELESTIA_BLOCKS_DA_SUM_QUERY = gql`
  query DataSubmission($timestamps: [Datetime!]!) {
    dataSubmissions(filter: { timestamp: { in: $timestamps } }) {
      totalCount
      aggregates {
        sum {
          byteSize
        }
      }
    }
  }
`;

export const CELESTIA_PRICE_DAY_DATAS_QUERY = gql`
  query CollectiveDayData($duration: Int) {
    collectiveDayData(first: $duration, orderBy: ID_DESC) {
      nodes {
        id
        timestampLast
        timestampStart
        totalByteSize
        avgNativePrice

        totalDataSubmissionCount
        totalDAFees
        totalDAFeesUSD
      }
    }
  }
`;

export const CELESTIA_BASIC_APP_DATAS_QUERY = gql`
  query AppEntities {
    appEntities(orderBy: TOTAL_BYTE_SIZE_ASC) {
      nodes {
        id
        totalByteSize
        totalDAFees
        totalFeesNative
        totalDAFeesUSD
        name
      }
    }
  }
`;
export const CELESTIA_DA_COST_DATAS_QUERY = gql`
  query DataSubmission($duration: Int) {
    dataSubmissions(first: $duration, orderBy: TIMESTAMP_DESC) {
      nodes {
        feesUSD
        byteSize
        fees
        timestamp
      }
    }
  }
`;
export const CELESTIA_BLOCK_QUERY = gql`
  query BlockDatum($id: String!) {
    blockDatum(id: $id) {
      id
      hash
      height
      timestamp
      proposer
      avgNativePrice
      totalBlockFeeUSD
      totalBlockFeeNatve
      totalBlobSize
      totalEventsCount
      totalTransactionCount
      totalBlobTransactionCount
      transactions {
        nodes {
          hash
          timestamp
          txFeeNative
          blockHeightId
          nEvents
          id
          txFeeUSD
          txFeeNative
          totalBytes
          signerId
          timestamp
          blobs {
            nodes {
              commitment
              signer
              size
            }
          }
        }
      }
    }
  }
`;
export const CELESTIA_TXN_QUERY = gql`
  query TransactionDatum($id: String!) {
    transactionDatum(id: $id) {
      hash
      timestamp
      txFeeNative
      blockHeightId
      nEvents
      id
      txFeeUSD
      txFeeNative
      totalBytes
      signerId
      timestamp
      blockHeight {
        currentNativePrice
      }
      blobs {
        nodes {
          commitment
          signer
          size
        }
      }
    }
  }
`;
