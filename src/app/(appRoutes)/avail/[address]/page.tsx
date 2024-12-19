"use client";
import SingleAvailAccount from "@/views/Avail/SingleAvailAccount";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailAccPage({}: Props) {
  const { address = "" } = useParams();

  return <SingleAvailAccount account={address as string} />;
}

export default SingleAvailAccPage;
