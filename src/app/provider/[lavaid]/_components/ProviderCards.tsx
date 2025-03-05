// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import React, { useState, useEffect } from 'react';
import StatCard from "@jsinfo/components/sections/StatCard";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { ArrowUpNarrowWide, Landmark, MonitorCog, Trophy } from "lucide-react";
import LoaderImageForCards from "@jsinfo/components/modern/LoaderImageForCards";
import { FormatNumber } from '@jsinfo/lib/formatting';
import { GetInfoNetwork } from '@jsinfo/lib/env';
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";


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
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsCuRelayAndRewards/${addr}`);

    if (error) return <ErrorDisplay message={error} />;
    return (
        <>
            <StatCard
                title="Total CU"
                value={isLoading ? <LoaderImageForCards /> : data?.cuSum || 0}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total compute units for provider"
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Relays"
                value={isLoading ? <LoaderImageForCards /> : data?.relaySum || 0}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total relays for provider"
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
        </>
    );
};

const StakesCard: React.FC<{ addr: string }> = ({ addr }: { addr: string }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error) {
        console.error('ProviderStakesCard Error:', error);
        return null;
    }

    if (!isLoading && (!data || !data.stakeSum)) return null;

    return (
        <StatCard
            title="Total Stake"
            value={isLoading ? <LoaderImageForCards /> : <LavaWithTooltip amount={data?.stakeSum || "0"} />}
            className="col-span-2 md:col-span-1"
            formatNumber={false}
            tooltip="Total stake for all specs"
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const DelegatorRewardsCard: React.FC<{ addr: string }> = ({ addr }: { addr: string }) => {
    const { data: rawData, isLoading, error } = useJsinfobeFetch(`providerCardsDelegatorRewards/${addr}`);
    const data = rawData as DelegatorRewardsResponse;
    const network = GetInfoNetwork().toLowerCase();

    if (isLoading || error || data?.error) return null;

    const filteredRewards = network.includes('mainnet')
        ? data?.data.rewards
        : data?.data.rewards.filter(reward => reward.denom.toLowerCase().includes('lava'));

    if (!filteredRewards || filteredRewards.length === 0) return null;

    // Calculate total USD value
    const totalUsdValue = filteredRewards.reduce((sum, reward) =>
        sum + parseFloat(String(reward.usdcValue || '0')), 0);

    const lavaReward = filteredRewards.find(r => r.denom === 'lava')?.amount.toString() || '0';

    return (
        <div className="col-span-2 md:col-span-1">
            <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm"
                style={{ backgroundColor: 'var(--background-color)' }}>
                <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                    <h3 className="text-sm font-medium">Claimable Provider Rewards</h3>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6 pt-0">
                    <ModernTooltip
                        content={
                            <div className="space-y-1">
                                <div className="font-medium border-b pb-1 mb-1">Reward Breakdown</div>
                                {filteredRewards.map((reward, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{`${FormatNumber(reward.amount)} ${reward.denom.toUpperCase()}`}</span>
                                        <span className="ml-4 text-gray-300">
                                            ${parseFloat(String(reward.usdcValue || '0')).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <div className="text-2xl font-bold flex items-center">
                            <span>${totalUsdValue.toFixed(2)}</span>
                            <span className="text-sm text-gray-400 ml-2">
                                ({lavaReward} LAVA)
                            </span>
                        </div>
                    </ModernTooltip>
                </div>
            </div>
        </div>
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