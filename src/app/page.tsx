// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { IndexChart } from "./_components/IndexChart";
import { IndexAllCards } from "./_components/IndexPageCards";
import IndexProvidersTableBlock from "./_components/IndexProvidersTableBlock";
import IndexChainsTableBlock from "./_components/IndexChainsTableBlock";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  return (
    <>
      <IndexAllCards />

      <IndexChart />
      <div className="box-margin-div"></div>
      <div className="box-margin-div"></div>
      <div className="box-margin-div"></div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
        <IndexProvidersTableBlock />
        <IndexChainsTableBlock />
      </div>
    </>
  );
}