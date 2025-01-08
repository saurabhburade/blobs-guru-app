"use client";
import SingleAvailBlock from "@/views/Avail/Blocks/SingleAvailBlock";
import SingleAvailTxn from "@/views/Avail/Txn/SingleAvailTxn";
import SingleBlock from "@/views/Blocks/SingleBlock";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailBlockPage({}: Props) {
  const { _hash = "" } = useParams();

  return <SingleAvailTxn hash={_hash as string} />;
}

export default SingleAvailBlockPage;
