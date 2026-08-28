"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';

const SingleTxn = dynamic(() => import("@/views/Celestia/Txn/SingleTxn"), { ssr: false });
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({ }: Props) {
  const { _hash = "" } = useParams();

  return <SingleTxn hash={_hash as string} />;
}

export default SingleBlockPage;
