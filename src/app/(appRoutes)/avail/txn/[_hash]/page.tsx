"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAvailBlock = dynamic(() => import("@/views/Avail/Blocks/SingleAvailBlock"), { ssr: false });
const SingleAvailTxn = dynamic(() => import("@/views/Avail/Txn/SingleAvailTxn"), { ssr: false });
const SingleBlock = dynamic(() => import("@/views/Blocks/SingleBlock"), { ssr: false });
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailBlockPage({ }: Props) {
  const { _hash = "" } = useParams();

  return <SingleAvailTxn hash={_hash as string} />;
}

export default SingleAvailBlockPage;
