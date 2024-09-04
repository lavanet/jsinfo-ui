// src/app/providers/page.tsx

"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import IndexChart from "@jsinfo/components/charts/IndexChart";
import { ProvidersAllCards } from "./_components/ProvidersPageCards";
import ProvidersProvidersTab from "./_components/ProvidersProvidersTab";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('providers');
  }, [setCurrentPage]);

  return (
    <>
      <ProvidersAllCards />

      <IndexChart />
      <div className="box-margin-div"></div>
      <div className="box-margin-div"></div>
      <div className="box-margin-div"></div>

      <Card>
        <JsinfoTabs defaultValue="providers"
          tabs={[
            {
              value: "providers",
              content: "Providers",
            },
          ]}
        >
          <Box>
            <ProvidersProvidersTab />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}