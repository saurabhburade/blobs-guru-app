"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleAvailBlock = dynamic(() => import("@/views/Avail/Blocks/SingleAvailBlock"), { ssr: false });
const SingleBlock = dynamic(() => import("@/views/Blocks/SingleBlock"), { ssr: false });
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailBlockPage({ }: Props) {
  const { _blockNumber = 1 } = useParams();

  return <SingleAvailBlock blockNumber={Number(_blockNumber)} />;
}

export default SingleAvailBlockPage;
