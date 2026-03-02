"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAccount = dynamic(() => import("@/views/Accounts/SingleAccount"), { ssr: false });
const SingleBlock = dynamic(() => import("@/views/Blocks/SingleBlock"), { ssr: false });
const SingleTransaction = dynamic(() => import("@/views/Transactions/SingleTransaction"), { ssr: false });
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({ }: Props) {
  const { address = "" } = useParams();

  return <SingleAccount account={(address as string)?.toLowerCase()} />;
}

export default SingleBlockPage;
