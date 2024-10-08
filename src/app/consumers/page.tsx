// src/app/consumers/page.tsx

"use client";

import React from "react";
import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import ConsumersConsumersTable from './_components/ConsumersConsumersTable';

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('consumers');
  }, []);

  return (
    <>
      <ConsumersConsumersTable />
    </>
  );
}
