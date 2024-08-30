// src/app/_components/IndexChainsTab.tsx
"use client";

import React from "react";
import { Tabs } from "@radix-ui/themes";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import { ConvertToChainName } from "@jsinfo/lib/convertors";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { FormatNumber } from "@jsinfo/lib/formatting";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import LoaderImageForCards from "@jsinfo/components/legacy/LoaderImageForCards";

interface Item {
    chainId: string;
    [key: string]: any;
}

export default function IndexChainsTab() {
    const { data, loading, error } = useApiFetch("indexTopChains");
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <Tabs.Content value="chains"><LoaderImageForCards /></Tabs.Content>
    );

    function transformSpecsData(data: Item[]) {
        if (!data) return [];
        return data.map((item) => ({
            ...item,
            chainName: ConvertToChainName(item.chainId),
        }));
    }

    const transformedSpecData = transformSpecsData(data.allSpecs);

    return (
        <SortableTableInATabComponent
            columns={[
                { key: "chainId", name: "Spec" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
                { key: "cuSum", name: "Total Cus" },
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
    );
};
