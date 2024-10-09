"use client";
import SingleBlock from "@/views/Blocks/SingleBlock";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({}: Props) {
  const { _blockNumber = 1 } = useParams();

  return <SingleBlock blockNumber={Number(_blockNumber)} />;
}

export default SingleBlockPage;
