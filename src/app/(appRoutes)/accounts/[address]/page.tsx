"use client";
import SingleAccount from "@/views/Accounts/SingleAccount";
import SingleBlock from "@/views/Blocks/SingleBlock";
import SingleTransaction from "@/views/Transactions/SingleTransaction";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({}: Props) {
  const { address = "" } = useParams();

  return <SingleAccount account={(address as string)?.toLowerCase()} />;
}

export default SingleBlockPage;
