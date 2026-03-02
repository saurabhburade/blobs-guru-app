"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleBlock = dynamic(() => import("@/views/Blocks/SingleBlock"), { ssr: false });
const SingleTransaction = dynamic(() => import("@/views/Transactions/SingleTransaction"), { ssr: false });
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({ }: Props) {
  const { _txnhash = "" } = useParams();

  return <SingleTransaction hash={_txnhash as string} />;
}

export default SingleBlockPage;
