// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { ChainsAllCards } from "./_components/ChainsPageCards";
import ChainsChainsTab from "./_components/ChainsChainsTab";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('chains');
  }, [setCurrentPage]);

  return (
    <>
      <ChainsAllCards />
      <ChainsChainsTab />
    </>
  );
}