// src/app/chains/_components/ChainsChainsTab.tsx
"use client";

import React from "react";
import { SortableTableComponent } from "@jsinfo/components/classic/StaticSortTable";
import { ConvertToChainName } from "@jsinfo/lib/chain-assets/chain-names";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { FormatNumber } from "@jsinfo/lib/formatting";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

interface Item {
    chainId: string;
    [key: string]: any;
}

export default function ChainsChainsTab() {
    const { data, loading, error } = useJsinfobeFetch("indexTopChains");
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
                { key: "chainId", name: "Chain" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
                { key: "cuSum", name: "Total Cus" },
            ]}
            key="ChainsChainsTabs"
            data={transformedSpecData}
            defaultSortKey="relaySum|desc"
            tableAndTabName="chains"
            pkey="chainId"
            pkeyUrl="none"
            rowFormatters={{
                chainId: (data) => (
                    <ChainWithIconLink chainId={data.chainId} className="orangelinks" />
                ),
                relaySum: (data) => FormatNumber(data.relaySum),
                cuSum: (data) => FormatNumber(data.cuSum),
            }}
        />
    );
};
