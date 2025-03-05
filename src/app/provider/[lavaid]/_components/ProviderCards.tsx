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
    const isTestnet = !GetInfoNetwork().toLowerCase().includes('mainnet');

    if (isLoading || error || data?.error || !data?.data?.rewards?.length) return null;

    // Get all rewards for processing
    const rewards = data.data.rewards;

    // Find LAVA rewards
    const lavaReward = rewards.find(r => r.denom.toLowerCase() === 'lava');
    if (!lavaReward) return null; // No LAVA rewards to show

    // For testnet, only show LAVA
    if (isTestnet) {
        return (
            <StatCard
                title="Claimable Provider Rewards"
                value={`${FormatNumber(lavaReward.amount)} LAVA`}
                formatNumber={false}
                className="col-span-2 md:col-span-1"
                icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
                tooltip="The rewards the provider can claim"
            />
        );
    }

    // For mainnet, show all rewards
    const totalUsdValue = rewards.reduce((sum, reward) =>
        sum + parseFloat(String(reward.usdcValue || '0')), 0);

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
                                {rewards.map((reward, index) => (
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