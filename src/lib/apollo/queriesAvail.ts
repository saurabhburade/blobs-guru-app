import { gql } from "@apollo/client";

export const AVAIL_COLLECTIVE_STAT_QUERY = gql`
  query {
    collectiveData {
      nodes {
        totalByteSize
        totalBlocksCount
        totalDataSubmissionCount
        totalFees
        totalDAFees
        totalDAFeesUSD
        totalExtrinsicCount
        avgAvailPrice
        avgEthPrice
        totalDataBlocksCount
        totalBlocksCount
        timestampLast
        lastPriceFeed {
          availPrice
          ethPrice
        }
        endBlock
      }
    }
  }
`;
export const AVAIL_ACCOUNTS_LIMIT_QUERY = gql`
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
        totalExtrinsicCount
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

export const AVAIL_APP_ACCOUNTS_LIMIT_QUERY = gql`
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
        totalExtrinsicCount
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
export const AVAIL_APPS_LIMIT_QUERY = gql`
  query AppEntities($skip: Int, $limit: Int) {
    appEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) {
      totalCount
      nodes {
        id
        name
        totalByteSize
        totalFeesAvail
        totalExtrinsicCount
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
export const AVAIL_APPS_QUERY = gql`
  query AppEntities {
    appEntities(orderBy: TOTAL_BYTE_SIZE_DESC) {
      totalCount
      nodes {
        id
        name
        totalByteSize
        totalFeesAvail
        totalExtrinsicCount
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
export const AVAIL_SINGLE_APP_QUERY = gql`
  query AppEntity($appId: String!) {
    appEntity(id: $appId) {
      id
      name
      totalByteSize
      totalFeesAvail
      totalExtrinsicCount
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
export const AVAIL_ACCOUNT_EXT_LIMIT_QUERY = gql`
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
        availPrice
        blockHeight
        extrinsicIndex
      }
    }
  }
`;
export const AVAIL_BLOCKS_LIMIT_QUERY = gql`
  query Blocks($skip: Int, $limit: Int) {
    blocks(orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) {
      nodes {
        nbEvents
        timestamp
        id
        blockFee
        nbExtrinsics
        nbEvents
        availPrice
      }
    }
  }
`;
export const AVAIL_DA_EXT_FILTER_LIMIT_QUERY = gql`
  query DataSubmission($extrinsicIds: [String!]!) {
    dataSubmissions(filter: { extrinsicId: { in: $extrinsicIds } }) {
      nodes {
        byteSize
        id
        extrinsicId
        fees
        priceFeed {
          availPrice
        }
      }
    }
  }
`;
export const AVAIL_ACCOUNT_SINGLE_QUERY = gql`
  query AccountEntity($address: String!) {
    accountEntity(id: $address) {
      id
      totalByteSize
      totalFees
      totalExtrinsicCount
      totalDAFees
      endBlock
      startBlock
      totalDataSubmissionCount
      totalFeesUSD
      totalDAFeesUSD
      totalFeesAvail
    }
  }
`;
export const AVAIL_ACCOUNT_SEARCH = gql`
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
export const AVAIL_SEARCH = gql`
  query SearchEntities($query: String!) {
    accountEntities(
      filter: { address: { includesInsensitive: $query }, type: { equalTo: 0 } }
      first: 2
    ) {
      nodes {
        id
      }
    }
    appEntities(filter: { name: { includesInsensitive: $query } }) {
      nodes {
        id
        name
      }
    }
  }
`;
export const AVAIL_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query CollectiveDayData($duration: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalExtrinsicCount
        totalFees
        timestampLast
        timestampStart
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesAvail
        appDayDataParticipant(orderBy: TOTAL_BYTE_SIZE_DESC) {
          nodes {
            id
            appId
            app {
              name
            }
            totalByteSize
            totalExtrinsicCount
            totalDataSubmissionCount
            totalFeesUSD
            totalDAFeesUSD
            totalFeesAvail
          }
        }
      }
    }
  }
`;
export const AVAIL_DAY_DATAS_WITH_DURATION_WITH_ACCOUNTS_QUERY = gql`
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
          orderBy: TOTAL_EXTRINSIC_COUNT_DESC
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          nodes {
            totalExtrinsicCount
            accountId
          }
        }
        accountDayDataParticipantOthers: accountDayDataParticipant(
          orderBy: TOTAL_EXTRINSIC_COUNT_DESC
          offset: $limit
          filter: { type: { equalTo: 0 } }
        ) {
          totalCount
          aggregates {
            sum {
              totalExtrinsicCount
            }
          }
        }
      }
    }
  }
`;
export const AVAIL_HOUR_DATAS_WITH_DURATION_QUERY = gql`
  query CollectiveHourData($duration: Int) {
    collectiveHourData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) {
      totalCount
      nodes {
        id
        totalExtrinsicCount
        totalFees
        timestampLast
        timestampStart
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesAvail
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
export const AVAIL_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AccountDayData($address: String, $duration: Int) {
    accountDayData(
      filter: { accountId: { equalTo: $address } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalExtrinsicCount
        totalFees
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        accountId
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesAvail
      }
    }
  }
`;
export const AVAIL_BALANCE_ACCOUNT_DAY_DATAS_WITH_DURATION_QUERY = gql`
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
export const AVAIL_APP_DAY_DATAS_WITH_DURATION_QUERY = gql`
  query AppDayData($appId: String, $duration: Int) {
    appDayData(
      filter: { appId: { equalTo: $appId } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalExtrinsicCount
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesAvail
      }
    }
  }
`;
export const AVAIL_ACCOUNT_HOUR_DATAS_WITH_DURATION_QUERY = gql`
  query AccountHourData($address: String, $duration: Int) {
    accountHourData(
      filter: { accountId: { equalTo: $address } }
      orderBy: TIMESTAMP_LAST_DESC
      first: $duration
    ) {
      totalCount
      nodes {
        id
        totalExtrinsicCount
        totalFees
        timestampLast
        timestampStart
        totalFeesUSD
        totalByteSize
        accountId
        totalDataSubmissionCount
        totalFeesUSD
        totalDAFeesUSD
        totalFeesAvail
      }
    }
  }
`;
export const AVAIL_BLOCKS_WITH_LIMIT_QUERY = gql`
  query Block($limit: Int) {
    blocks(first: $limit, orderBy: TIMESTAMP_DESC) {
      nodes {
        id
        timestamp
      }
    }
  }
`;
export const AVAIL_BLOCKS_DA_SUM_QUERY = gql`
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

export const AVAIL_PRICE_DAY_DATAS_QUERY = gql`
  query CollectiveDayData($duration: Int) {
    collectiveDayData(first: $duration, orderBy: ID_DESC) {
      nodes {
        id
        timestampLast
        timestampStart
        totalByteSize
        avgAvailPrice
        avgEthPrice
        totalDataSubmissionCount
        totalDAFees
        totalDAFeesUSD
      }
    }
  }
`;

export const AVAIL_BASIC_APP_DATAS_QUERY = gql`
  query DataSubmission {
    dataSubmissions(orderBy: APP_ID_DESC) {
      totalCount
      groupedAggregates(groupBy: APP_ID) {
        keys
        distinctCount {
          signer
        }
        sum {
          fees
          byteSize
        }
      }
    }
  }
`;
export const AVAIL_DA_COST_DATAS_QUERY = gql`
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
export const AVAIL_BLOCK_QUERY = gql`
  query Block($id: String!) {
    block(id: $id) {
      id
      blockFee
      hash
      parentHash
      stateRoot
      extrinsicsRoot
      availPrice
      timestamp
      nbEvents
      nbExtrinsics
      runtimeVersion
      extrinsics {
        nodes {
          id
          fees
          module
          timestamp
          signer
          fees
          nbEvents
          blockHeight
          extrinsicIndex
          dataSubmissions {
            totalCount
            aggregates {
              sum {
                byteSize
                fees
                feesUSD
              }
            }
          }
        }
        groupedAggregates(groupBy: MODULE) {
          keys
        }
      }
    }
  }
`;
