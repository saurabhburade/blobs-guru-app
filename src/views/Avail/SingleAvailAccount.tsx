"use client";
import Header from "@/components/Header/Header";
import {
  BLOB_ACCOUNT_SINGLE_QUERY,
  BLOB_ACCOUNTS_EXPLORER_QUERY,
  BLOB_BLOCKS_EXPLORER_QUERY,
  BLOB_BLOCKS_TOP_FIVE_QUERY,
  BLOB_BLOCKS_TOP_QUERY,
  BLOB_TRANSACTIONS_ACCOUNT_QUERY,
  BLOB_TRANSACTIONS_EXPLORER_QUERY,
  COLLECTIVE_STAT_QUERY,
  TOP_BLOB_ACCOUNTS_QUERY,
  TOP_FIVE_BLOB_ACCOUNTS_QUERY,
} from "@/lib/apollo/queries";
import { formatAddress, formatBytes, formatEthereumValue } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryFetch } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { Box, Database, NotepadText, User } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import BlobTransactionDayChart from "../Home/components/BlobTransactionDayChart";
import { getAccountDetailsFromAddressBook } from "@/configs/constants";
import TransactionRowSkeleton from "@/components/Skeletons/TransactionRowSkeleton";
import axios from "axios";
import { useAccountTransactionsWithRPCData } from "@/hooks/useTransactionsData";
import { timeAgo } from "@/lib/time";
import Sidebar from "@/components/Sidebar/Sidebar";
import Footer from "@/components/Footer/Footer";
import PoweredBy from "../Home/components/PoweredBy";
import AvailAccountStatCard from "./components/AccountStats/AvailAccountStatCard";
import { AVAIL_ACCOUNT_SINGLE_QUERY } from "@/lib/apollo/queriesAvail";
import { availClient } from "@/lib/apollo/client";

type Props = {
  account: string;
};

function SingleAvailAccount({ account }: Props) {
  const { data, loading } = useQuery(AVAIL_ACCOUNT_SINGLE_QUERY, {
    variables: {
      address: account,
    },
    client: availClient,
  });
  console.log(`🚀 ~ file: SingleAvailAccount.tsx:54 ~ data:`, data);
  const accountDetails = getAccountDetailsFromAddressBook(
    account?.toLowerCase()
  );

  return (
    <div className="grid lg:grid-cols-[1.25fr_5fr] gap-0 h-screen">
      <div className="lg:block hidden">
        <Sidebar />
      </div>
      <div className="lg:hidden block">
        <Header />
      </div>
      <div className="p-5 min-h-[90vh] h-screen overflow-scroll flex flex-col space-y-4 pb-10 ">
        <div className=" w-full lg:flex-row flex-col flex justify-between gap-4 items-center lg:my-0 my-[5em]">
          <h2 className="lg:text-xl text-xl font-semibold">Avail Account</h2>
        </div>
        <div className="w-full space-y-4 ">
          <div className="">
            <AvailAccountStatCard
              acc={data?.accountEntity}
              isLoading={loading}
            />
          </div>
        </div>
        <PoweredBy />
        <Footer />
      </div>
    </div>
  );
}

export default SingleAvailAccount;
