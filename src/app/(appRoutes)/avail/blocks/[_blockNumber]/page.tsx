"use client";
import SingleAvailBlock from "@/views/Avail/Blocks/SingleAvailBlock";
import SingleBlock from "@/views/Blocks/SingleBlock";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailBlockPage({}: Props) {
  const { _blockNumber = 1 } = useParams();

  return <SingleAvailBlock blockNumber={Number(_blockNumber)} />;
}

export default SingleAvailBlockPage;
