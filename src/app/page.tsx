// src/app/page.tsx
"use client";

import React, { useEffect } from "react";
import { Flex, Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import IndexChart from "@jsinfo/charts/indexChart";
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import MonikerWithTooltip from "@jsinfo/components/MonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/LavaWithTooltip";
import { IndexAllCards, LatestBlockCard } from "./_components/indexPageCards";
import IndexChainsTab from "./_components/indexChainsTab";
import { usePageContext } from "@jsinfo/context/PageContext";

export default function Home() {
  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  return (
    <>
      <LatestBlockCard />

      <div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3">
          <IndexAllCards />
        </Flex>
      </div>

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
            <DataKeySortableTableInATabComponent
              columns={[
                { key: "moniker", name: "Moniker" },
                { key: "provider", name: "Provider Address" },
                { key: "rewardSum", name: "Total Rewards" },
                {
                  key: "totalServices",
                  name: "Total Services",
                  altKey: "nStakes",
                },
                { key: "totalStake", name: "Total Stake" },
              ]}
              defaultSortKey="totalStake|desc"
              tableAndTabName="providers"
              pkey="provider"
              pkeyUrl="provider"
              firstColumn="moniker"
              dataKey="indexProviders"
              rowFormatters={{
                moniker: (data) => (<MonikerWithTooltip provider={data} />),
                rewardSum: (data) => (<LavaWithTooltip amount={data.rewardSum} />),
                totalStake: (data) => (<LavaWithTooltip amount={data.totalStake} />),
              }}
              csvButton={<TableCsvButton csvDownloadLink="indexProvidersCsv" />}
            />

            <IndexChainsTab />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
