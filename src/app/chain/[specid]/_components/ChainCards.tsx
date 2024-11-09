// src/app/chain/[specid]/_components/ChainCards.tsx
"use client";

import React from 'react';
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, ArrowUpNarrowWide, CreditCard, Users, Activity, Database, SquareActivity, Network } from 'lucide-react';
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";
import ChainProviderHealthSummary from './ChainEndpointHealthSummary';
import { FormatNumber } from '@jsinfo/lib/formatting';
import { useLogpushFetch } from '@jsinfo/fetching/logpush/hooks/useLogpushFetch';

interface SpecCardsProps {
    specId: string;
}

interface SpecTrackedInfoResponse {
    cuSum: string;
}

const SpecIpRpcCuCard: React.FC<{ specid: string }> = ({ specid }) => {
    const { data, loading, error } = useJsinfobeFetch<SpecTrackedInfoResponse>(`specTrackedInfo/${specid}`);

    if (loading || error || !data || data.cuSum === "0") return null;

    return (
        <StatCard
            title="Monthly IP/RPC CU"
            value={FormatNumber(data.cuSum)}
            className="col-span-1"
            icon={<Network className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const SpecCuRelayRewardsCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useJsinfobeFetch(`specCuRelayRewards/${specId}`);
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
        </>
    );
};

const SpecProviderCountCard: React.FC<SpecCardsProps> = ({ specId }) => {
    const { data, loading, error } = useJsinfobeFetch(`specProviderCount/${specId}`);
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
    const { data, loading, error } = useJsinfobeFetch(`specEndpointHealth/${specId}`);
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
    const { data, loading, error } = useLogpushFetch(`stats/?chain_id=${specId.toLocaleLowerCase()}`);
    if (error) return <ErrorDisplay message={error} />;
    if (loading) return (
        <StatCard
            title="Cache Hit Rate (24 hours)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const cacheHitRate = data.total_requests > 0
        ? ((data.cached_requests / data.total_requests) * 100).toFixed(2)
        : "0";

    return (
        <StatCard
            title="Cache Hit Rate (24 hours)"
            value={`${cacheHitRate}%`}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cached requests: ${FormatNumber(data.cached_requests)}
Total requests: ${FormatNumber(data.total_requests)}
Time period: ${new Date(data.start_date).toLocaleString()} - ${new Date(data.end_date).toLocaleString()}`}
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const SpecCards: React.FC<SpecCardsProps> = ({ specId }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <SpecCuRelayRewardsCard specId={specId} />
            <SpecIpRpcCuCard specid={specId} />
            <SpecProviderCountCard specId={specId} />
            <SpecEndpointHealthCard specId={specId} />
            <SpecCacheHitRateCard specId={specId} />
        </div>
    );
};

export default SpecCards;