// src/app/_components/indexPageComponent.tsx

import React from "react";
import { Flex, Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import IndexChart from "@jsinfo/charts/indexChart";
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import MonikerWithTooltip from "@jsinfo/components/MonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/LavaWithTooltip";
import { IndexAllCards, LatestBlockCard } from "./indexPageCards";
import IndexChainsTab from "./indexChainsTab";

export const IndexPageComponent: React.FC = () => {
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
                                    name: "Active/Total Services",
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
                                totalServices: (data) => (<span title={`The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider`}>{data.totalServices}</span>)
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