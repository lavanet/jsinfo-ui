// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import IndexChart from "@jsinfo/components/charts/IndexChart";
import { IndexAllCards } from "./_components/IndexPageCards";
import IndexChainsTab from "./_components/IndexChainsTab";
import IndexProvidersTab from "./_components/IndexProvidersTab";

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

      <Card>
        <JsinfoTabs defaultValue="providers"
          tabs={[
            {
              value: "providers",
              content: "Providers",
            },
            {
              value: "chains",
              content: "Chains",
            },
          ]}
        >
          <Box>
            <IndexProvidersTab />
            <IndexChainsTab />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}