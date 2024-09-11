// src/app/chain/[specid]/_components/ChainCards.tsx
"use client";

import { ArrowUpNarrowWide, CreditCard, DatabaseZap, MonitorCog, SquareActivity } from "lucide-react";
import StatCard from "@jsinfo/components/sections/StatCard";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import SpecEndpointHealthSummary from './ChainEndpointHealthSummary';
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";

export default function ChainsCards({ specId }: { specId: string }) {
    // Fetch the data inside the component
    const { data, loading, error } = useApiFetch("spec/" + specId);

    if (error) return <ErrorDisplay message={error} />;
    if (loading) return <LoadingIndicator loadingText={`Loading ${specId} chain stats`} greyText={`${specId} chain`} />;

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <StatCard
                    title="Chain"
                    value={data.specId}
                    className="col-span-1"
                />
                <StatCard
                    title="Providers"
                    value={data.providerCount}
                    className="col-span-1"
                />
                <StatCard
                    title="Total CU"
                    value={data.cuSum}
                    className="col-span-1"
                    formatNumber={true}
                    tooltip={`Total compute units for ${data.specId} by all providers`}
                    icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Total Relays"
                    value={data.relaySum}
                    className="col-span-1"
                    formatNumber={true}
                    tooltip={`Total relays for ${data.specId} by all providers`}
                    icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Total Rewards"
                    value={<LavaWithTooltip amount={data.rewardSum} />}
                    className="col-span-1 md:col-span-1"
                    formatNumber={false}
                    tooltip={`Total rewards for ${data.specId} by all providers`}
                    icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Endpoint Status"
                    value={(
                        <SpecEndpointHealthSummary
                            healthy={data?.endpointHealth?.healthy || 0}
                            unhealthy={data?.endpointHealth?.unhealthy || 0}
                        />
                    )}
                    className="col-span-1 md:col-span-1"
                    formatNumber={false}
                    tooltip={`Total rewards for ${data.specId} by all providers`}
                    icon={<SquareActivity className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Cache hit/total (30 days)"
                    value={data.cacheHitRate ? `${data.cacheHitRate} %` : "0"}
                    className="col-span-1 md:col-span-1"
                    formatNumber={false}
                    tooltip={`Cache hit/total for ${data.specId} in the last 30 days`}
                    icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
        </>
    );
}
