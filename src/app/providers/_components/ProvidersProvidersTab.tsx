// src/app/providers/_components/ProvidersProvidersTab.tsx

import React from "react";
import { DataKeySortableTableComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import MonikerWithTooltip from "@jsinfo/components/modern/MonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { Tabs } from "@radix-ui/themes";
import { IsMainnet } from "@jsinfo/lib/env";

export default function ProvidersProviderTab() {
    const columns = [
        { key: "moniker", name: "Moniker" },
        { key: "provider", name: "Provider Address" },
        ...(IsMainnet() ? [
            { key: "rewardsULAVA", name: "LAVA Rewards", tooltip: "The total amount of LAVA rewards earned by the provider in the last month" },
            { key: "rewardsUSD", name: "USD Rewards", tooltip: "The total amount of USD rewards earned by the provider in the last month" }
        ] : []),
        {
            key: "totalServices",
            name: "Active/Total Services",
            altKey: "nStakes",
            tooltip: "The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider"
        },
        { key: "totalStake", name: "Total Stake" }
    ];

    return (
        <Tabs.Content value={"providers"}>
            <DataKeySortableTableComponent
                key="activeProviders"
                columns={columns}
                defaultSortKey="totalStake|desc"
                tableAndTabName="activeProviders"
                pkey="provider"
                pkeyUrl="provider"
                firstColumn="moniker"
                dataKey="indexProvidersActive"
                rowFormatters={{
                    moniker: (data) => <MonikerWithTooltip provider={data} />,
                    totalStake: (data) => <LavaWithTooltip amount={data.totalStake} />,
                    rewardsULAVA: (data) => data.rewardsULAVA == "-" ? "-" : <LavaWithTooltip amount={data.rewardsULAVA} />,
                    rewardsUSD: (data) => data.rewardsUSD == "-" ? "-" : <span>{data.rewardsUSD}</span>,
                    totalServices: (data) => data.totalServices
                }}
                csvButton={<TableCsvButton csvDownloadLink="indexProvidersActiveCsv" />}
                csvButtonMargin="-17px"
            />
        </Tabs.Content>
    );
}
