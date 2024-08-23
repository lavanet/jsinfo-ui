// src/app/consumers/page.tsx

"use client";

import React from "react";
import { useEffect } from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import { ConvertToChainName } from "@jsinfo/common/convertors";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import { RenderInFullPageCard } from "@jsinfo/common/utils";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import ConsumersConsumersTable from './_components/ConsumersConsumersTable';

export default function Home() {

  const { data, loading, error } = useApiDataFetch({ dataKey: "consumerspage" });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('consumers');
    }
  }, [loading, error, setCurrentPage]);

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText="Loading Consumers page" greyText="Consumers" />);

  interface Item {
    chainId: string;
    [key: string]: any;
  }

  function transformSpecsData(data: Item[]) {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      chainName: ConvertToChainName(item.chainId),
    }));
  }

  const transformedSpecData = transformSpecsData(data.allSpecs);

  return (
    <>
      <BlockWithDateCard blockData={data} />

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
    </>
  );
}
