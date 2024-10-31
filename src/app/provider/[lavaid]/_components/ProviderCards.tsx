// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import React, { useState, useEffect } from 'react';
import StatCard from "@jsinfo/components/sections/StatCard";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { ArrowUpNarrowWide, CreditCard, Landmark, MonitorCog, Trophy } from "lucide-react";
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";
import { FormatNumber } from '@jsinfo/lib/formatting';


interface ProviderCardsProps {
    addr: string;
}

interface DelegatorReward {
    amount: number;
    denom: string;
    usdcValue: number;
    provider: string;
}

interface DelegatorRewardsResponse {
    delegator: string;
    data: {
        rewards: DelegatorReward[];
        fmtversion: string;
    };
    timestamp: string;
    error?: string;
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

const DelegatorRewardsCard: React.FC<{ addr: string }> = ({ addr }: { addr: string }) => {
    const { data: rawData, loading, error } = useJsinfobeFetch(`providerCardsDelegatorRewards/${addr}`);
    const data = rawData as DelegatorRewardsResponse;

    if (loading || error || data?.error) return null;

    return (
        <StatCard
            title="Delegator Rewards"
            value={data?.data.rewards
                .sort((a, b) => {
                    const aLength = `${a.provider}: ${FormatNumber(a.amount)} ${a.denom.toUpperCase()}`.length;
                    const bLength = `${b.provider}: ${FormatNumber(b.amount)} ${b.denom.toUpperCase()}`.length;
                    return bLength - aLength;  // b - a for descending order
                })
                .map((reward, index) => (
                    <div key={index}>
                        {reward.provider !== addr && `${reward.provider}: `}
                        {`${FormatNumber(reward.amount)} ${reward.denom.toUpperCase()}`}
                    </div>
                ))
            }
            formatNumber={false}
            className="col-span-2 md:col-span-1"
            icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            tooltip="Dual Stacking rewards for provider"
        />
    );
};

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }: { addr: string }) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1279);
        };

        // Check initial size
        checkScreenSize();

        // Add resize listener
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const cards = isSmallScreen ? (
        <>
            <CuRelayAndRewardsCard addr={addr} />
            <StakesCard addr={addr} />
            <DelegatorRewardsCard addr={addr} />
        </>
    ) : (
        <>
            <CuRelayAndRewardsCard addr={addr} />
            <DelegatorRewardsCard addr={addr} />
            <StakesCard addr={addr} />
        </>
    );

    return (
        <>
            <div className="provider-cards-grid">
                {cards}
            </div>
            <div style={{ marginTop: '25px' }}></div>
        </>
    );
};

export default ProviderCards;