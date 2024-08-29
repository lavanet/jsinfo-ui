// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import dynamic from 'next/dynamic';
import { IndexPageComponent } from "./_components/IndexPageComponent";
import React from "react";

const NoSsr = (props: { children: any }) => (
  <React.Fragment>{props.children}</React.Fragment>
)

function loadNoSsrDynamically() {
  return dynamic(() => Promise.resolve(NoSsr), {
    ssr: false,
  });
}

const NoSsrComponent = loadNoSsrDynamically();

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  return <NoSsrComponent><IndexPageComponent /></NoSsrComponent>
}
