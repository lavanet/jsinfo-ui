// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import React from 'react';
import StatCard from "@jsinfo/components/sections/StatCard";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { ArrowUpNarrowWide, CalendarHeart, CreditCard, FolderHeart, HeartHandshake, Landmark, MonitorCog } from "lucide-react";
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";

interface ProviderCardsProps {
    addr: string;
}

const ClaimableRewardsCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, loading, error } = useApiFetch(`providerCardsClaimableRewards/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <StatCard
            title="Claimable Rewards"
            value={loading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.claimableRewards || "0"} />}
            className="col-span-2 md:col-span-1"
            formatNumber={false}
            icon={<HeartHandshake className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const ClaimedRewards30DaysCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, loading, error } = useApiFetch(`providerCardsClaimedRewards30Days/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <StatCard
            title="Claimed Rewards (Last 30 Days)"
            value={loading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.claimedRewards30DaysAgo?.split(' ')[0] || "0"} />}
            className="col-span-2 md:col-span-1"
            formatNumber={false}
            icon={<CalendarHeart className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const ClaimedRewardsAllTimeCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, loading, error } = useApiFetch(`providerCardsClaimedRewardsAllTime/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <StatCard
            title="Total Claimed Rewards (All Time)"
            value={loading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.claimedRewardsAllTime?.split(' ')[0] || "0"} />}
            className="col-span-2 md:col-span-1"
            formatNumber={false}
            icon={<FolderHeart className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const CuRelayAndRewardsCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, loading, error } = useApiFetch(`providerCardsCuRelayAndRewards/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <>
            <StatCard
                title="Total CU"
                value={loading ? <LoaderImageForCards /> : data?.cuSum || 0}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total compute units for provider"
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Relays"
                value={loading ? <LoaderImageForCards /> : data?.relaySum || 0}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total relays for provider"
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Rewards"
                value={loading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.rewardSum?.toString() || "0"} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                tooltip="Total rewards for provider"
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
        </>
    );
};

const StakesCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, loading, error } = useApiFetch(`providerCardsStakes/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <StatCard
            title="Total Stake"
            value={loading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.stakeSum || "0"} />}
            className="col-span-2 md:col-span-1"
            formatNumber={false}
            tooltip="Total stake for all specs"
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }) => {
    return (
        <>
            <div style={{ marginTop: '20px' }}></div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <CuRelayAndRewardsCard addr={addr} />
                <StakesCard addr={addr} />
                <ClaimableRewardsCard addr={addr} />
                <ClaimedRewardsAllTimeCard addr={addr} />
                <ClaimedRewards30DaysCard addr={addr} />
            </div>
            <div style={{ marginTop: '25px' }}></div>
        </>
    );
};

export default ProviderCards;