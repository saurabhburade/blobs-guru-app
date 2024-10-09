"use client";
import SingleBlock from "@/views/Blocks/SingleBlock";
import SingleTransaction from "@/views/Transactions/SingleTransaction";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({}: Props) {
  const { _txnhash = "" } = useParams();

  return <SingleTransaction hash={_txnhash as string} />;
}

export default SingleBlockPage;
