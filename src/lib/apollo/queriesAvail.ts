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
