"use client";
export const runtime = 'edge';

import SingleTxn from "@/views/Celestia/Txn/SingleTxn";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({ }: Props) {
  const { _hash = "" } = useParams();

  return <SingleTxn hash={_hash as string} />;
}

export default SingleBlockPage;
