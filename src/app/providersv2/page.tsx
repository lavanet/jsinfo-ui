// src/app/providers/page.tsx

"use client";

import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import React from "react";
import { Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import { ProvidersAllCards } from "./_components/ProvidersPageCards";
import ProvidersProvidersTab from "./_components/ProvidersProvidersTab";
import IndexProvidersTable from "./_components/IndexProvidersTable";
export default function Home() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('providers');
  }, [setCurrentPage]);

  return (
    <>
      {/* <ProvidersAllCards /> */}

      This is the new table for the provider page:

      <br />
      <br />

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
      <br />
      <br />

      This is the new for the index page::
      <br />
      <br />
      <IndexProvidersTable />
    </>
  );
}