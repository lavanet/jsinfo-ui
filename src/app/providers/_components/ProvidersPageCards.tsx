// src/app/providers/_components/ProvidersPageCards.tsx

import React from 'react';
import { useApiFetch } from '@jsinfo/hooks/useApiFetch';
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import { FormatAsULava } from '@jsinfo/components/modern/LavaWithTooltip';
import LoaderImageForCards from '@jsinfo/components/modern/LoaderImageForCards';
import { FormatNumber, FormatNumberKMB } from '@jsinfo/lib/formatting';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, CalendarArrowUp, ArrowUpNarrowWide, Landmark, CalendarCog, Activity } from 'lucide-react';

export const Providers30DayRelayCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("index30DayCu");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Relays (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarArrowUp className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.relaySum30Days);
    const value = FormatNumberKMB(data.relaySum30Days);

    return (
        <StatCard
            title="Relays (30 days)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarArrowUp className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalRelaysCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexTotalCu");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Relays (All Time)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.relaySum);
    const value = FormatNumberKMB(data.relaySum);

    return (
        <StatCard
            title="Relays (All Time)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
            icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const Providers30DayCUCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("index30DayCu");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="CU (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarCog className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.cuSum30Days);
    const value = FormatNumberKMB(data.cuSum30Days);

    return (
        <StatCard
            title="CU (30 days)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
            icon={<CalendarCog className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalCuCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexTotalCu");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="CU (All Time)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.cuSum);
    const value = FormatNumberKMB(data.cuSum);

    return (
        <StatCard
            title="CU (All Time)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
            icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersStakeCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexStakesHandler");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Stake"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    );

    let ulavaValue = FormatAsULava(data.stakeSum);
    let stakeSumLava = parseInt(data.stakeSum + "", 10) / 1000000
    let lavaValue = FormatNumberKMB(stakeSumLava + "");

    return (
        <StatCard
            title="Stake"
            value={lavaValue + " LAVA"}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days.\nvalue in ulava: ${ulavaValue}.`}
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ProvidersTotalActiveProviders: React.FC = () => {
    const { data, loading, error } = useApiFetch("item-count/indexProvidersActive");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Total active providers"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const itemCount = data.itemCount ?? 0;

    return (
        <StatCard
            title="Total active providers"
            value={itemCount}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days`}
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
