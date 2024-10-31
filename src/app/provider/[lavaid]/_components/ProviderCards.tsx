// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import React from 'react';
import StatCard from "@jsinfo/components/sections/StatCard";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { ArrowUpNarrowWide, CreditCard, Landmark, MonitorCog } from "lucide-react";
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";

interface ProviderCardsProps {
    addr: string;
}

const CuRelayAndRewardsCard: React.FC<{ addr: string }> = ({ addr }: { addr: string }) => {
    const { data, loading, error } = useJsinfobeFetch(`providerCardsCuRelayAndRewards/${addr}`);

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

const StakesCard: React.FC<{ addr: string }> = ({ addr }: { addr: string }) => {
    const { data, loading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

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

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }: { addr: string }) => {
    return (
        <>
            <div className="provider-cards-grid">
                <CuRelayAndRewardsCard addr={addr} />
                <StakesCard addr={addr} />
            </div>
            <div style={{ marginTop: '25px' }}></div>
        </>
    );
};

export default ProviderCards;