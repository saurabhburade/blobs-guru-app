"use client";
import dynamic from "next/dynamic";
export const runtime = 'edge';
const SingleBlock = dynamic(() => import("@/views/Celestia/Blocks/SingleBlock"), { ssr: false });

import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleBlockPage({ }: Props) {
  const { _blockNumber = 1 } = useParams();

  return <SingleBlock blockNumber={Number(_blockNumber)} />;
}

export default SingleBlockPage;
