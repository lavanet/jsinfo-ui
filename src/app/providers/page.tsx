// src/app/providers/page.tsx

"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import { ProvidersAllCards } from "./_components/ProvidersPageCards";
import ProvidersProvidersTab from "./_components/ProvidersProvidersTab";
import LegacyTheme from "@jsinfo/components/classic/LegacyTheme";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('providers');
  }, [setCurrentPage]);

  return (
    <>
      <ProvidersAllCards />

      <LegacyTheme>
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
      </LegacyTheme>
    </>
  );
}