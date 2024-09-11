// src/app/providers/_components/ProvidersProvidersTab.tsx

import React, { useState } from "react";
import { DataKeySortableTableComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import MonikerWithTooltip from "@jsinfo/components/modern/MonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import TextCheckbox from "@jsinfo/components/classic/TextCheckbox";
import { Tabs } from "@radix-ui/themes";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";

export default function ProvidersProviderTab() {
    const [dataKey, setDataKey] = useState("indexProvidersActive");

    const handleShowInactiveProviders = (value: any, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
        setDataKey(checked ? "indexProviders" : "indexProvidersActive");
    };

    let tableCheckbox = (
        <div style={{ color: 'grey', margin: '5px', marginLeft: '13px' }}>
            <TextCheckbox key="indexprovidertabcheckbox" text="Show inactive providers" onChange={handleShowInactiveProviders} style={{ display: 'inline-block' }} />
        </div>
    )

    if ("indexProviders" == dataKey) {
        return (
            <Tabs.Content value={"providers"}>
                {tableCheckbox}
                <DataKeySortableTableComponent
                    key="inactiveProviders"
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
                    tableAndTabName="inactiveProviders"
                    pkey="provider"
                    pkeyUrl="provider"
                    firstColumn="moniker"
                    dataKey="indexProviders"
                    rowFormatters={{
                        moniker: (data) => (<MonikerWithTooltip provider={data} />),
                        rewardSum: (data) => (<LavaWithTooltip amount={data.rewardSum} />),
                        totalStake: (data) => (<LavaWithTooltip amount={data.totalStake} />),
                        totalServices: (data) => (<ModernTooltip title={`The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider`}>{data.totalServices}</ModernTooltip>)
                    }}
                    csvButton={<TableCsvButton csvDownloadLink="indexProvidersCsv" />}
                />
            </Tabs.Content>
        );
    }

    return (
        <Tabs.Content value={"providers"}>
            {tableCheckbox}
            <DataKeySortableTableComponent
                key="activeProviders"
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
                tableAndTabName="activeProviders"
                pkey="provider"
                pkeyUrl="provider"
                firstColumn="moniker"
                dataKey="indexProvidersActive"
                rowFormatters={{
                    moniker: (data) => (<MonikerWithTooltip provider={data} />),
                    rewardSum: (data) => (<LavaWithTooltip amount={data.rewardSum} />),
                    totalStake: (data) => (<LavaWithTooltip amount={data.totalStake} />),
                    totalServices: (data) => (<ModernTooltip title={`The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider`}>{data.totalServices}</ModernTooltip>)
                }}
                csvButton={<TableCsvButton csvDownloadLink="indexProvidersActiveCsv" />}
                NoAutoScrollOnceContentIsLoaded={true}
            />
        </Tabs.Content>
    );
};
