// src/app/_components/IndexPageCards.tsx

import React from 'react';
import { useApiFetch } from '@jsinfo/hooks/useApiFetch';
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import { FormatAsULava } from '@jsinfo/components/legacy/LavaWithTooltip';
import LoaderImageForCards from '@jsinfo/components/legacy/LoaderImageForCards';
import { FormatNumber, FormatNumberKMB } from '@jsinfo/lib/formatting';
import StatCard from '@jsinfo/components/sections/StatCard';
import { Contact, Users, CalendarArrowUp, ArrowUpNarrowWide, Landmark, DatabaseZap } from 'lucide-react';

export const IndexUniqueUsersCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexMonthlyUsers");
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <StatCard
            title="Unique Users (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Contact className="h-4 w-4 text-muted-foreground" />}
        />
    );
    return (
        <StatCard
            title="Unique Users (30 days)"
            value={data.monthlyUsers}
            className="col-span-1"
            formatNumber={true}
            icon={<Contact className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const IndexUniqueUsersAvgCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexMonthlyUsersAvg");
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <StatCard
            title="Unique Users (Daily Average)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const tooltip = FormatNumber(data.monthlyUsersAvg);
    const value = FormatNumberKMB(data.monthlyUsersAvg);

    return (
        <StatCard
            title="Unique Users (Daily Average)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const Index30DayCUCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("index30DayCu");
    if (error) return ErrorDisplay({ message: error });
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

export const IndexTotalCUCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexTotalCu");
    if (error) return ErrorDisplay({ message: error });
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
    const { data, loading, error } = useApiFetch("indexStakesHandler");
    if (error) return ErrorDisplay({ message: error });
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

export const IndexChacheHitCard: React.FC = () => {
    const { data, loading, error } = useApiFetch("indexCachedMetrics");
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <StatCard
            title="Cache hit/total (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
        />
    );
    return (
        <StatCard
            title="Cache hit/total (30 days)"
            value={data.cacheHitRate ? `${data.cacheHitRate} %` : "0"}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days`}
            icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const IndexAllCards: React.FC = () => {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <IndexUniqueUsersCard />
                <IndexUniqueUsersAvgCard />
                <IndexTotalCUCard />
                <Index30DayCUCard />
                <IndexStakeCard />
                <IndexChacheHitCard />
            </div>
            <div style={{ marginTop: '30px' }}></div>
        </>
    );
};
