// src/app/consumers/page.tsx

"use client";

import React from "react";
import { useEffect } from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import { RenderInFullPageCard } from "@jsinfo/lib/utils";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import ConsumersConsumersTable from './_components/ConsumersConsumersTable';
import LegacyTheme from "@jsinfo/components/legacy/LegacyTheme";

export default function Home() {

  const { data, loading, error } = useApiFetch("consumerspage");

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('consumers');
    }
  }, [loading, error, setCurrentPage]);

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText="Loading Consumers page" greyText="Consumers" />);

  return (
    <>
      <LegacyTheme>
        <Card>
          <JsinfoTabs defaultValue="consumers"
            tabs={[
              {
                value: "consumers",
                content: "Consumers",
              },
            ]}
          >
            <Box>
              <ConsumersConsumersTable />
            </Box>
          </JsinfoTabs>
        </Card>
      </LegacyTheme>
    </>
  );
}
