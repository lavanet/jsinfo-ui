// src/app/_components/IndexProviderTab.tsx

import React from "react";
import { DataKeySortableTableComponent } from "@jsinfo/components/legacy/DynamicSortTable";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { Tabs } from "@radix-ui/themes";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";
import MonikerAndProviderLink from "@jsinfo/components/modern/MonikerAndProviderLink";

export default function IndexProviderTab() {
    return (
        <Tabs.Content value={"providers"}>
            <DataKeySortableTableComponent
                key="activeProviders"
                columns={[
                    { key: "moniker", name: "Moniker" },
                    {
                        key: "totalServices",
                        name: "Active/Total Services",
                        altKey: "nStakes",
                    },
                    { key: "totalStake", name: "Total Stake" },
                ]}
                defaultSortKey="totalStake|desc"
                tableAndTabName="activeProviders"
                pkey="provider"
                pkeyUrl="provider"
                firstColumn="moniker"
                dataKey="indexProvidersActive"
                rowFormatters={{
                    moniker: (data) => (<MonikerAndProviderLink provider={data} />),
                    totalStake: (data) => (<LavaWithTooltip amount={data.totalStake} />),
                    totalServices: (data) => (<ModernTooltip title={`The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider`}>{data.totalServices}</ModernTooltip>)
                }}
            />
        </Tabs.Content>
    );
};
