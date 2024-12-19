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
      orderBy: TOTAL_EXTRINSIC_COUNT_DESC
      first: $limit
      offset: $skip
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
      }
    }
  }
`;
