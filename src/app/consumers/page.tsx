// src/app/consumers/page.tsx

"use client";

import React from "react";
import { useEffect } from "react";
import { Flex, Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TitledCard from "@jsinfo/components/TitledCard";
import { SortableTableInATabComponent } from "@jsinfo/components/StaticSortTable";
import { ConvertToChainName } from "@jsinfo/common/convertors";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import { FormatNumber, RenderInFullPageCard } from "@jsinfo/common/utils";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import ConsumersChart from "@jsinfo/charts/consumersChart";
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

      <div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3">
          <TitledCard
            title="Relays"
            value={data.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="CU"
            value={data.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Total Count"
            value={data.consumerCount}
            className="col-span-1"
            formatNumber={true}
          />
        </Flex>
      </div>

      <ConsumersChart />
      <div className="box-margin-div"></div>

      <Card>
        <JsinfoTabs defaultValue="consumers"
          tabs={[
            {
              value: "consumers",
              content: "Consumers",
            },
            {
              value: "chains",
              content: "Chains",
            },
          ]}
        >
          <Box>
            <ConsumersConsumersTable />

            <SortableTableInATabComponent
              columns={[
                { key: "chainId", name: "Spec" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
                { key: "cuSum", name: "Total CUs" },
              ]}
              data={transformedSpecData}
              defaultSortKey="relaySum|desc"
              tableAndTabName="chains"
              pkey="chainId"
              pkeyUrl="spec"
              rowFormatters={{
                relaySum: (data) => FormatNumber(data.relaySum),
                cuSum: (data) => FormatNumber(data.cuSum),
              }}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
