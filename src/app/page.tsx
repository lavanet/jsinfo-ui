// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";

import { IndexPageComponent } from "./_components/IndexPageComponent";
import React from "react";
import { NoSsrComponent } from "@jsinfo/components/helpers/NoSsrComponent";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  return <NoSsrComponent><IndexPageComponent /></NoSsrComponent>
}
