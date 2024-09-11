// src/app/chains/_components/ChainsChainsTab.tsx
"use client";

import React from "react";
import { SortableTableComponent } from "@jsinfo/components/classic/StaticSortTable";
import { ConvertToChainName } from "@jsinfo/lib/convertors";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { FormatNumber } from "@jsinfo/lib/formatting";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";

interface Item {
    chainId: string;
    [key: string]: any;
}

export default function ChainsChainsTab() {
    const { data, loading, error } = useApiFetch("indexTopChains");
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <LoadingIndicator loadingText={`Loading chains table`} greyText={`chains`} />
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
        <SortableTableComponent
            columns={[
                { key: "chainId", name: "Spec" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
                { key: "cuSum", name: "Total Cus" },
            ]}
            key="ChainsChainsTabs"
            data={transformedSpecData}
            defaultSortKey="relaySum|desc"
            tableAndTabName="chains"
            pkey="chainId"
            pkeyUrl="chain"
            rowFormatters={{
                relaySum: (data) => FormatNumber(data.relaySum),
                cuSum: (data) => FormatNumber(data.cuSum),
            }}
        />
    );
};
