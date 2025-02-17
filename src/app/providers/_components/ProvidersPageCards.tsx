// src/app/providers/_components/ProvidersPageCards.tsx

import React from 'react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LoaderImageForCards from '@jsinfo/components/modern/LoaderImageForCards';
import { FormatNumber, FormatNumberKMB } from '@jsinfo/lib/formatting';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, CalendarArrowUp, ArrowUpNarrowWide, Landmark, CalendarCog, Activity } from 'lucide-react';

// Add these interfaces at the top of the file after the imports
interface CUData {
    relaySum30Days: number;
    relaySum: number;
    cuSum30Days: number;
    cuSum: number;
}

interface StakeData {
    stakeSum: string | number;
}

interface ItemCountData {
    itemCount: number;
}

export const Providers30DayRelayCard: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<CUData>("index30DayCu");

    if (error) return <ErrorDisplay message={error} />
    if (isLoading || !data) return (
        <StatCard
            title="Relays (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarArrowUp className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.relaySum30Days);
    const value = FormatNumberKMB(data.relaySum30Days.toString());

    return (
        <StatCard
            title="Relays (30 days)"
            value={<span title={tooltip} style={{ whiteSpace: 'nowrap' }}>{value}</span>}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Total number of relays processed by all providers in the last 30 days",
                `Exact value: ${tooltip}`
            ].join('\n')}
            icon={<CalendarArrowUp className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalRelaysCard: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<CUData>("indexTotalCu");

    if (error) return <ErrorDisplay message={error} />
    if (isLoading || !data) return (
        <StatCard
            title="Relays (All Time)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.relaySum);
    const value = FormatNumberKMB(data.relaySum.toString());

    return (
        <StatCard
            title="Relays (All Time)"
            value={<span title={tooltip} style={{ whiteSpace: 'nowrap' }}>{value}</span>}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Total number of relays processed since genesis",
                `Exact value: ${tooltip}`
            ].join('\n')}
            icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const Providers30DayCUCard: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<CUData>("index30DayCu");
    if (error) return <ErrorDisplay message={error} />
    if (isLoading || !data) return (
        <StatCard
            title="CU (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarCog className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.cuSum30Days);
    const value = FormatNumberKMB(data.cuSum30Days.toString());

    return (
        <StatCard
            title="CU (30 days)"
            value={<span title={tooltip} style={{ whiteSpace: 'nowrap' }}>{value}</span>}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Total Compute Units (CU) processed in the last 30 days",
                `Exact value: ${tooltip}`
            ].join('\n')}
            icon={<CalendarCog className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalCuCard: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<CUData>("indexTotalCu");
    if (error) return <ErrorDisplay message={error} />
    if (isLoading || !data) return (
        <StatCard
            title="CU (All Time)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.cuSum);
    const value = FormatNumberKMB(data.cuSum.toString());

    return (
        <StatCard
            title="CU (All Time)"
            value={<span title={tooltip} style={{ whiteSpace: 'nowrap' }}>{value}</span>}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Total Compute Units (CU) processed since genesis",
                `Exact value: ${tooltip}`
            ].join('\n')}
            icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersStakeCard: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<StakeData>("indexStakesHandler");

    if (error) return <ErrorDisplay message={error} />
    if (isLoading || !data) return (
        <StatCard
            title="Stake"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const stakeNum = Number(data.stakeSum);
    const ulavaValue = FormatNumber(stakeNum) + " ULAVA";
    const lavaAmount = stakeNum / 1_000_000;
    const lavaValue = FormatNumber(Number(lavaAmount.toFixed(2))) + " LAVA";

    return (
        <StatCard
            title="Stake"
            value={lavaValue}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Total amount staked by all providers",
                `Value in ulava: ${ulavaValue}`
            ].join('\n')}
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalActiveProviders: React.FC = () => {
    const { data, isLoading, error } = useJsinfobeFetch<ItemCountData>("item-count/indexProvidersActive");
    if (error) return <ErrorDisplay message={error} />
    if (isLoading) return (
        <StatCard
            title="Total active providers"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const typedData = data as ItemCountData;
    const itemCount = typedData.itemCount ?? 0;

    return (
        <StatCard
            title="Total active providers"
            value={itemCount}
            className="col-span-1"
            formatNumber={false}
            tooltip={[
                "Number of providers that are currently active in the network.",
                "Active means: not jailed, not frozen, and has processed at least 1 relay in the last 30 days."
            ].join('\n')}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersAllCards: React.FC = () => {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Providers30DayCUCard />
                <ProvidersTotalCuCard />
                <ProvidersTotalRelaysCard />
                <Providers30DayRelayCard />
                <ProvidersStakeCard />
                <ProvidersTotalActiveProviders />
            </div>
            <div style={{ marginTop: '30px' }}></div>
        </>
    );
};
