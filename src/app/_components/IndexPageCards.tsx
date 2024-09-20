// src/app/_components/IndexPageCards.tsx

import React from 'react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import { FormatAsULava } from '@jsinfo/components/modern/LavaWithTooltip';
import LoaderImageForCards from '@jsinfo/components/modern/LoaderImageForCards';
import { FormatNumber, FormatNumberKMB } from '@jsinfo/lib/formatting';
import StatCard from '@jsinfo/components/sections/StatCard';
import { CalendarArrowUp, ArrowUpNarrowWide, Landmark, DatabaseZap } from 'lucide-react';
import { useLogpushFetch } from '@jsinfo/fetching/logpush/hooks/useLogpushFetch';

export const Index30DayRelayCard: React.FC = () => {
    const { data, loading, error } = useJsinfobeFetch("index30DayCu");
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

export const IndexTotalRelaysCard: React.FC = () => {
    const { data, loading, error } = useJsinfobeFetch("indexTotalCu");
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

export const IndexStakeCard: React.FC = () => {
    const { data, loading, error } = useJsinfobeFetch("indexStakesHandler");
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

export const IndexCacheHitCard: React.FC = () => {
    const { data, loading, error } = useLogpushFetch("stats");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Cache hit/total (24 hours)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const cacheHitRate = data.total_requests > 0
        ? ((data.cached_requests / data.total_requests) * 100).toFixed(2)
        : "0";

    return (
        <StatCard
            title="Cache hit/total (24 hours)"
            value={`${cacheHitRate}%`}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cached requests: ${FormatNumber(data.cached_requests)}
Total requests: ${FormatNumber(data.total_requests)}
Average latency: ${data.avg_latency.toFixed(2)} ms
Average requests/sec: ${FormatNumber(data.avg_requests_per_sec)}
Unique users: ${FormatNumber(data.unique_users)}
Time period: ${new Date(data.start_date).toLocaleString()} - ${new Date(data.end_date).toLocaleString()}`}
            icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const IndexAllCards: React.FC = () => {
    return (
        <>
            <div className="grid gap-4 grid-cols-2 md:gap-8 lg:grid-cols-4">
                <IndexTotalRelaysCard />
                <Index30DayRelayCard />
                <IndexStakeCard />
                <IndexCacheHitCard />
            </div>
            <div style={{ marginTop: '30px' }}></div>
        </>
    );
};
