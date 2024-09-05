// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import { ChainsAllCards } from "./_components/ChainsPageCards";
import ChainsChainsTab from "./_components/ChainsChainsTab";
import LegacyTheme from "@jsinfo/components/legacy/LegacyTheme";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('chains');
  }, [setCurrentPage]);

  return (
    <>
      <ChainsAllCards />

      <LegacyTheme>
        <Card>
          <JsinfoTabs defaultValue="chains"
            tabs={[
              {
                value: "chains",
                content: "Chains",
              },
            ]}
          >
            <Box>
              <ChainsChainsTab />
            </Box>
          </JsinfoTabs>
        </Card>
      </LegacyTheme>
    </>
  );
}