// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { ChainsAllCards } from "./_components/ChainsPageCards";
import ChainsChainsTab from "./_components/ChainsChainsTab";
import ClassicTheme from "@jsinfo/components/classic/ClassicTheme";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('chains');
  }, [setCurrentPage]);

  return (
    <>
      <ChainsAllCards />
      <ClassicTheme>
        <ChainsChainsTab />
      </ClassicTheme>
    </>
  );
}