"use client";
import SingleAvailApp from "@/views/Avail/Apps/SingleAvailApp";
import SingleAvailAccount from "@/views/Avail/SingleAvailAccount";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

function SingleAvailAccPage({}: Props) {
  const { appId = "" } = useParams();

  return <SingleAvailApp appId={appId as string} />;
}

export default SingleAvailAccPage;
