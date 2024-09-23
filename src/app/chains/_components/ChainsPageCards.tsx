// src/app/chains/_components/ChainsPageCards.tsx

import React from 'react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LoaderImageForCards from '@jsinfo/components/modern/LoaderImageForCards';
import StatCard from '@jsinfo/components/sections/StatCard';
import { Link, Blocks } from 'lucide-react';

export const LatestLavaBlockCard: React.FC = () => {
    const { data, loading, error } = useJsinfobeFetch("indexLatestBlock");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Lava Latest Block"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Blocks className="h-4 w-4 text-muted-foreground" />}
        />
    );

    return (
        <StatCard
            title="Lava Latest Block"
            value={data.height}
            className="col-span-1"
            formatNumber={true}
            icon={<Blocks className="h-4 w-4 text-muted-foreground" />}
            tooltip={"Latest Lava block height"}
        />
    )
};

export const TotalChainsCard: React.FC = () => {
    const { data, loading, error } = useJsinfobeFetch("indexTopChains");
    if (error) return <ErrorDisplay message={error} />
    if (loading) return (
        <StatCard
            title="Active Chain Count"
            value={<LoaderImageForCards />}
            className="col-span-1"
            formatNumber={false}
            icon={<Link className="h-4 w-4 text-muted-foreground" />}
        />
    );

    const chainCount = data?.allSpecs?.length ?? 0;

    return (
        <StatCard
            title="Active Chain Count"
            value={chainCount}
            className="col-span-1"
            formatNumber={true}
            icon={<Link className="h-4 w-4 text-muted-foreground" />}
        />
    )
};

export const ChainsAllCards: React.FC = () => {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <LatestLavaBlockCard />
                <TotalChainsCard />
            </div>
            <div style={{ marginTop: '25px' }}></div>
        </>
    );
};
