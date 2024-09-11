// src/app/providers/page.tsx

"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import { ProvidersAllCards } from "./_components/ProvidersPageCards";
import ProvidersProvidersTab from "./_components/ProvidersProvidersTab";
import ClassicTheme from "@jsinfo/components/classic/ClassicTheme";

export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('providers');
  }, [setCurrentPage]);

  return (
    <>
      <ProvidersAllCards />

      <ClassicTheme>
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
      </ClassicTheme>
    </>
  );
}