// src/app/page.tsx
"use client";

import React from "react";
import { useEffect } from "react";
import { Flex, Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import CsvButton from "@jsinfo/components/CsvButton";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TitledCard from "@jsinfo/components/TitledCard";
import IndexChart from "@jsinfo/charts/indexChart";
import { SortableTableInATabComponent, DataKeySortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { ConvertToChainName } from "@jsinfo/common/convertors";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import { FormatNumber, RenderInFullPageCard } from "@jsinfo/common/utils";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";

export default function Home() {

  const { data, loading, error } = useApiDataFetch({ dataKey: "index" });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('home');
    }
  }, [loading, error, setCurrentPage]);

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText="Loading Landing page" greyText="Landing" />);

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
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3 ">
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
            title="Stake"
            value={`${data.stakeSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </Card>

      <IndexChart />

      <Card>
        <JsinfoTabs defaultValue="providers"
          tabs={[
            {
              value: "providers",
              content: (
                <CsvButton
                  csvDownloadLink="indexProvidersCsv"
                >
                  Providers
                </CsvButton>
              ),
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
                { key: "addr", name: "Provider Address" },
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
              pkey="addr"
              pkeyUrl="provider"
              firstColumn="moniker"
              dataKey="indexProviders"
              rowFormatters={{
                rewardSum: (data) => FormatNumber(data.rewardSum),
                totalStake: (data) => FormatNumber(data.totalStake),
              }}
            />

            <SortableTableInATabComponent
              columns={[
                { key: "chainId", name: "Spec" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
              ]}
              data={transformedSpecData}
              defaultSortKey="relaySum|desc"
              tableAndTabName="chains"
              pkey="chainId"
              pkeyUrl="spec"
              rowFormatters={{
                relaySum: (data) => FormatNumber(data.relaySum),
              }}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
