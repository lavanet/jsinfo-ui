// src/app/providers/_components/ProvidersProvidersTab.tsx

import React from "react";
import { DataKeySortableTableComponent } from "./ProvidersDynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import MonikerWithTooltip from "./ProvidersMonikerWithTooltip";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { Tabs } from "@radix-ui/themes";
import { IsMainnet } from "@jsinfo/lib/env";
import Link from "next/link";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";
import { getStakeTooltipHtml } from "./ProvidersStakeTooltipContent";

// Medal component for top providers
const RankMedal = ({ rank }: { rank: number }) => {
    if (rank > 3) return null;

    const medalColors = {
        1: '#FFD700', // Gold
        2: '#C0C0C0', // Silver
        3: '#CD7F32'  // Bronze
    };

    const medalEmojis = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
    };

    return (
        <span
            style={{
                marginRight: '4px',
                color: medalColors[rank as 1 | 2 | 3],
                display: 'inline-block',
                pointerEvents: 'none'
            }}
            className="no-underline"
        >
            {medalEmojis[rank as 1 | 2 | 3]}
        </span>
    );
};

export default function ProvidersProviderTab() {
    // Use more specific styling with !important to override any default styles
    const columnStyle = {
        whiteSpace: 'nowrap !important',
        textAlign: 'left !important' as const,
        verticalAlign: 'top !important'
    };

    const columns = [
        {
            key: "rank",
            name: "Rank",
            style: {
                ...columnStyle,
                width: '50px',
                minWidth: '50px',
                maxWidth: '50px'
            }
        },
        {
            key: "moniker",
            name: "Moniker",
            style: {
                ...columnStyle,
                width: '185px',
                minWidth: '185px'
            }
        },
        {
            key: "provider",
            name: "Provider Address",
            style: {
                ...columnStyle,
                width: '280px',
                minWidth: '280px'
            }
        },
        {
            key: "formattedReputationScore",
            name: "Reputation Score",
            tooltip: "Provider reputation score based on performance metrics",
            style: {
                ...columnStyle,
                width: '140px',
                minWidth: '140px'
            }
        },
        ...(IsMainnet() ? [
            {
                key: "rewardsULAVA",
                name: "LAVA Rewards",
                tooltip: "The total amount of LAVA rewards earned by the provider in the last month",
                style: {
                    ...columnStyle,
                    width: '150px',
                    minWidth: '150px'
                }
            },
            {
                key: "rewardsUSD",
                name: "USD Rewards",
                tooltip: "The total amount of USD rewards earned by the provider in the last month",
                style: {
                    ...columnStyle,
                    width: '130px',
                    minWidth: '130px'
                }
            }
        ] : []),
        {
            key: "services",
            name: "Active/Total Services",
            tooltip: "The total number of active chains serviced by the provider (excluding frozen services) / the total number of serviced chains for the provider",
            style: {
                ...columnStyle,
                width: '180px',
                minWidth: '180px'
            }
        },
        {
            key: "stake",
            name: "Total Stake",
            tooltip: "Combined stake and delegations for all services",
            style: {
                ...columnStyle,
                width: '180px',
                minWidth: '180px'
            }
        }
    ];

    const getStakeTooltip = (data: any) => {
        return getStakeTooltipHtml(data);
    };

    return (
        <Tabs.Content value={"providers"}>
            <style jsx global>{`
                .providers-table th, 
                .providers-table td {
                    white-space: nowrap !important;
                    text-align: left !important;
                    vertical-align: top !important;
                }
            `}</style>

            <DataKeySortableTableComponent
                key="activeProviders"
                className="providers-table"
                columns={columns as any}
                defaultSortKey="rank|asc"
                tableAndTabName="activeProviders"
                pkey="provider"
                pkeyUrl="provider"
                firstColumn="moniker"
                dataKey="indexProvidersActiveV2"
                rowFormatters={{
                    moniker: (data) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RankMedal rank={data.rank} />
                            <MonikerWithTooltip provider={data} />
                        </div>
                    ),
                    provider: (data) => (
                        <Link className="orangelinks" href={`/provider/${data.provider}`}>
                            {data.provider}
                        </Link>
                    ),
                    services: (data) => `${data.activeServices} / ${data.totalServices}`,
                    stake: (data) => (
                        <ModernTooltip title={getStakeTooltip(data)} isHtml={true}>
                            <LavaWithTooltip amount={data.activeAndInactiveStakeTotalRaw} />
                        </ModernTooltip>
                    ),
                    rewardsULAVA: (data) => data.rewardsULAVA === "-" ? "-" : <LavaWithTooltip amount={data.rewardsULAVA} />,
                    rewardsUSD: (data) => data.rewardsUSD === "-" ? "-" : data.rewardsUSD
                }}
                csvButton={<TableCsvButton csvDownloadLink="indexProvidersActiveV2Csv" />}
                csvButtonMargin="-17px"
                leftAlignNoWrap={true}
            />
        </Tabs.Content>
    );
}
