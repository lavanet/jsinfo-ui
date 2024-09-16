// src/app/chain/[specid]/_components/ChainCards.tsx
"use client";

import React from 'react';
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, ArrowUpNarrowWide, CreditCard, Users, Activity, Database, SquareActivity } from 'lucide-react';
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";
import ChainProviderHealthSummary from './ChainEndpointHealthSummary';

interface SpecCardsProps {
    specId: string;
}

const SpecCuRelayRewardsCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useApiFetch(`specCuRelayRewards/${specId}`);
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <>
            <StatCard
                title="Total CU"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Relays"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Rewards"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
        </>
    );
    return (
        <>
            <StatCard
                title="Total CU"
                value={data.cuSum}
                className="col-span-1"
                formatNumber={true}
                tooltip={`Total compute units for ${specId} by all providers`}
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Relays"
                value={data.relaySum}
                className="col-span-1"
                formatNumber={true}
                tooltip={`Total relays for ${specId} by all providers`}
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            {/* <StatCard
                title="Total Rewards"
                value={<LavaWithTooltip amount={data.rewardSum} />}
                className="col-span-1"
                formatNumber={false}
                tooltip={`Total rewards for ${specId} by all providers`}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            /> */}
        </>
    );
};

const SpecProviderCountCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useApiFetch(`specProviderCount/${specId}`);
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <StatCard
            title="Provider Count"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
    );
    return (
        <StatCard
            title="Provider Count"
            value={data.providerCount}
            className="col-span-1"
            formatNumber={true}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
    );
};


const SpecEndpointHealthCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useApiFetch(`specEndpointHealth/${specId}`);
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <StatCard
            title="Endpoint Health"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
    );
    return (
        <StatCard
            title="Endpoint Status"
            value={(
                <ChainProviderHealthSummary
                    healthy={data?.endpointHealth?.healthy || 0}
                    unhealthy={data?.endpointHealth?.unhealthy || 0}
                />
            )}
            className="col-span-1 md:col-span-1"
            formatNumber={false}
            tooltip={`Total rewards for ${specId} by all providers`}
            icon={<SquareActivity className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const SpecCacheHitRateCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useApiFetch(`specCacheHitRate/${specId}`);
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <StatCard
            title="Cache Hit Rate"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
    );
    return (
        <StatCard
            title="Cache Hit Rate"
            value={`${data.cacheHitRate}%`}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for ${specId} in the last 30 days`}
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const SpecCards: React.FC<SpecCardsProps> = ({ specId }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <SpecCuRelayRewardsCard specId={specId} />
            <SpecProviderCountCard specId={specId} />
            <SpecEndpointHealthCard specId={specId} />
            <SpecCacheHitRateCard specId={specId} />
        </div>
    );
};

export default SpecCards;