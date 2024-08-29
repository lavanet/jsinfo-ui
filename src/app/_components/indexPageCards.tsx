// src/app/_components/IndexPageCards.tsx

import React from 'react';
import { useApiDataFetch } from '@jsinfo/hooks/useApiDataFetch';
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import TitledCard from '@jsinfo/components/legacy/TitledCard';
import { FormatAsULava } from '@jsinfo/components/legacy/LavaWithTooltip';
import BlockWithDateCard from '@jsinfo/components/legacy/BlockWithDateCard';
import LoaderImageForCards from '@jsinfo/components/legacy/LoaderImageForCards';
import { FormatNumber, FormatNumberKMB } from '@jsinfo/lib/formatting';

export const LatestBlockCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexLatestBlock" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return null;

    return (
        <BlockWithDateCard blockData={data} />
    );
};

export const IndexTotalCUCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexTotalCu" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Relays (All Time)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );

    const tooltip = FormatNumber(data.relaySum);
    const value = FormatNumberKMB(data.relaySum);

    return (
        <TitledCard
            title="Relays (All Time)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
        />
    )
};



export const Index30DayCUCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "index30DayCu" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Relays (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );

    const tooltip = FormatNumber(data.relaySum30Days);
    const value = FormatNumberKMB(data.relaySum30Days);

    return (
        <TitledCard
            title="Relays (30 days)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
        />
    )
};

export const IndexUniqueUsersCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexMonthlyUsers" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Unique Users (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );
    return (
        <TitledCard
            title="Unique Users (30 days)"
            value={data.monthlyUsers}
            className="col-span-1"
            formatNumber={true}
        />
    )
};

export const IndexUniqueUsersAvgCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexMonthlyUsersAvg" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Unique Users (Daily Average)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );

    const tooltip = FormatNumber(data.monthlyUsersAvg);
    const value = FormatNumberKMB(data.monthlyUsersAvg);

    return (
        <TitledCard
            title="Unique Users (Daily Average)"
            value={
                <span title={tooltip} style={{ whiteSpace: 'nowrap' }}>
                    {value}
                </span>
            }
            className="col-span-1"
            formatNumber={false}
        />
    )
};

export const IndexChacheHitCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexCachedMetrics" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Cache hit/total (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );
    return (
        <TitledCard
            title="Cache hit/total (30 days)"
            value={data.cacheHitRate ? `${data.cacheHitRate} %` : "0"}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days`}
        />
    )
};

export const IndexStakeCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "indexStakesHandler" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="Stake"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );

    let ulavaValue = FormatAsULava(data.stakeSum);
    let stakeSumLava = parseInt(data.stakeSum + "", 10) / 1000000
    let lavaValue = FormatNumberKMB(stakeSumLava + "");

    return (
        <TitledCard
            title="Stake"
            value={
                <span title={ulavaValue} style={{ whiteSpace: 'nowrap' }}>
                    {lavaValue} LAVA
                </span>}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days`}
        />
    )
};


export const IndexAllCards: React.FC = () => {
    return (
        <>
            <IndexUniqueUsersCard />
            <IndexUniqueUsersAvgCard />
            <IndexTotalCUCard />
            <Index30DayCUCard />
            <IndexStakeCard />
            <IndexChacheHitCard />
        </>
    );
};
