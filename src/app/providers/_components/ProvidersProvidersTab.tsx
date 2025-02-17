// src/app/providers/_components/ProvidersProvidersTab.tsx

import React, { useState } from "react";
import { DataKeySortableTableComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import MonikerWithTooltip from "@jsinfo/components/modern/MonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { Tabs } from "@radix-ui/themes";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";

export default function ProvidersProviderTab() {
    return (
        <Tabs.Content value={"providers"}>
            <DataKeySortableTableComponent
                key="activeProviders"
                columns={[
                    { key: "moniker", name: "Moniker" },
                    { key: "provider", name: "Provider Address" },
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
                    moniker: (data) => (<MonikerWithTooltip provider={data} />),
                    totalStake: (data) => (<LavaWithTooltip amount={data.totalStake} />),
                    totalServices: (data) => (<ModernTooltip title={`The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider`}>{data.totalServices}</ModernTooltip>)
                }}
                csvButton={<TableCsvButton csvDownloadLink="indexProvidersActiveCsv" />}
                csvButtonMargin="-17px"
            />
        </Tabs.Content>
    );
};
