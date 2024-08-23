// src/app/_components/indexPageCards.tsx

import React from 'react';
import { useApiDataFetch } from '@jsinfo/hooks/useApiDataFetch';
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import TitledCard from '@jsinfo/components/TitledCard';
import LavaWithTooltip from '@jsinfo/components/LavaWithTooltip';
import BlockWithDateCard from '@jsinfo/components/BlockWithDateCard';
import LoaderImageForCards from '@jsinfo/components/LoaderImageForCards';

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
            title="CU"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );
    return (
        <TitledCard
            title="CU"
            value={data.cuSum}
            className="col-span-1"
            formatNumber={true}
        />
    )
};

export const Index30DayCUCard: React.FC = () => {
    const { data, loading, error } = useApiDataFetch({ dataKey: "index30DayCu" });
    if (error) return ErrorDisplay({ message: error });
    if (loading) return (
        <TitledCard
            title="CU (30 days)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );
    return (
        <TitledCard
            title="CU (30 days)"
            value={data.cuSum30Days}
            className="col-span-1"
            formatNumber={true}
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
            title="Unique Users (daily avg)"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
        />
    );
    return (
        <TitledCard
            title="Unique Users (daily avg)"
            value={data.monthlyUsersAvg}
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
    return (
        <TitledCard
            title="Stake"
            value={< LavaWithTooltip amount={data.stakeSum} />}
            className="col-span-1"
            formatNumber={false}
            tooltip={`Cache hit/total for all specs in the last 30 days`}
        />
    )
};


export const IndexAllCards: React.FC = () => {
    return (
        <>
            <IndexTotalCUCard />
            <IndexUniqueUsersCard />
            <IndexUniqueUsersAvgCard />
            <Index30DayCUCard />
            <IndexChacheHitCard />
            <IndexStakeCard />
        </>
    );
};
