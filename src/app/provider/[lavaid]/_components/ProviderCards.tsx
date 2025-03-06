// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import React, { useState, useEffect } from 'react';
import StatCard from "@jsinfo/components/sections/StatCard";
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { ArrowUpNarrowWide, Landmark, MonitorCog, Trophy, Users, User, Coins } from "lucide-react";
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

// For StakeTotalCard, just show the value without a complex tooltip
const StakeTotalCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.stakeSum) {
        return isLoading ? <LoaderImageForCards /> : null;
    }

    const lavaAmount = Number(data.stakeSum) / 1000000;

    return (
        <div className="flex items-end">
            <span className="text-2xl font-bold">{FormatNumber(lavaAmount)}</span>
            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
        </div>
    );
};

// Simplify StakeDetailCards to remove the complex tooltips
const StakeDetailCards: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.stakeSum) return null;

    const selfStake = data?.stake || "0";
    const delegations = data?.delegateTotal || "0";

    const showSelfStake = parseInt(selfStake) > 0;
    const showDelegations = parseInt(delegations) > 0;

    return (
        <>
            {showDelegations && (
                <StatCard
                    title="Delegation Stake"
                    value={
                        <div className="flex items-end">
                            <span className="text-2xl font-bold">{FormatNumber(Number(delegations) / 1000000)}</span>
                            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
                        </div>
                    }
                    className="col-span-1"
                    formatNumber={false}
                    tooltip="Total stake from delegators"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
            )}

            {showSelfStake && (
                <StatCard
                    title="Self Stake"
                    value={
                        <div className="flex items-end">
                            <span className="text-2xl font-bold">{FormatNumber(Number(selfStake) / 1000000)}</span>
                            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
                        </div>
                    }
                    className="col-span-1"
                    formatNumber={false}
                    tooltip="Tokens bonded directly by the provider"
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                />
            )}
        </>
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
                value={`${FormatNumber(Number(lavaReward.amount))} LAVA`}
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
                                        <span>{`${FormatNumber(Number(reward.amount))} ${reward.denom.toUpperCase()}`}</span>
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
                                ({FormatNumber(Number(lavaReward.amount))} LAVA)
                            </span>
                        </div>
                    </ModernTooltip>
                </div>
            </div>
        </div>
    );
};

// Create components for the new cards
const CommissionCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.commission || data.commission === "0") return null;

    return (
        <StatCard
            title="Commission"
            value={`${data.commission}%`}
            className="col-span-1"
            formatNumber={false}
            tooltip="Percentage of delegation rewards retained by the provider"
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
        />
    );
};

const RewardsCards: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.rewards) return null;

    const { lava, usd } = data.rewards;
    const showLava = lava && lava !== "0";
    const showUsd = usd && usd !== "0";

    if (!showLava && !showUsd) return null;

    // Create a React component for the tooltip
    const rewardsTooltip = (
        <div>
            <p>Total rewards as distributed last month.</p>
            <a
                href="https://rewards.lavanet.xyz/provider_rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
            >
                View details on rewards.lavanet.xyz
            </a>
        </div>
    );

    return (
        <>
            {showLava && (
                <StatCard
                    title="Monthly LAVA Rewards"
                    value={
                        <div className="flex items-end">
                            <span className="text-2xl font-bold">{FormatNumber(Number(lava) / 1000000)}</span>
                            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
                        </div>
                    }
                    className="col-span-1"
                    formatNumber={false}
                    tooltip={rewardsTooltip}
                    icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
                />
            )}

            {showUsd && (
                <StatCard
                    title="Monthly USD Rewards"
                    value={`$${FormatNumber(Number(usd))}`}
                    className="col-span-1"
                    formatNumber={false}
                    tooltip={rewardsTooltip}
                    icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
                />
            )}
        </>
    );
};

// Update the ProviderCards component to swap Total Stake and Self Stake positions
const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }: { addr: string }) => {
    return (
        <>
            <div className="provider-cards-grid">
                {/* Row 1: CU, Relays, Total Stake (moved up) */}
                <CuRelayAndRewardsCard addr={addr} />

                <StatCard
                    title="Total Stake"
                    value={<StakeTotalCard addr={addr} />}
                    className="col-span-1"
                    formatNumber={false}
                    tooltip="Total bonded tokens (self stake + delegations)"
                    icon={<Coins className="h-4 w-4 text-muted-foreground" />}
                />

                {/* Row 2: Delegator Rewards, Commission */}
                <DelegatorRewardsCard addr={addr} />

                <CommissionCard addr={addr} />

                {/* Row 3: Monthly Rewards (LAVA and USD) */}
                <RewardsCards addr={addr} />

                {/* Row 4: Delegation Stake */}
                <StatCard
                    title="Delegation Stake"
                    value={
                        <div className="flex items-end">
                            <StakeDelegationCard addr={addr} />
                        </div>
                    }
                    className="col-span-1"
                    formatNumber={false}
                    tooltip="Total stake from delegators"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />

                {/* Row 5: Self Stake (moved down) */}
                <StatCard
                    title="Self Stake"
                    value={
                        <div className="flex items-end">
                            <StakeSelfCard addr={addr} />
                        </div>
                    }
                    className="col-span-2 md:col-span-1"
                    formatNumber={false}
                    tooltip="Tokens bonded directly by the provider"
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
            <div style={{ marginTop: '25px' }}></div>
        </>
    );
};

// Create individual stake components for reuse
const StakeSelfCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.stake) {
        return isLoading ? <LoaderImageForCards /> : null;
    }

    const lavaAmount = Number(data.stake) / 1000000;

    return (
        <div className="flex items-end">
            <span className="text-2xl font-bold">{FormatNumber(lavaAmount)}</span>
            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
        </div>
    );
};

const StakeDelegationCard: React.FC<{ addr: string }> = ({ addr }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerCardsStakes/${addr}`);

    if (error || isLoading || !data?.delegateTotal) {
        return isLoading ? <LoaderImageForCards /> : null;
    }

    const lavaAmount = Number(data.delegateTotal) / 1000000;

    return (
        <div className="flex items-end">
            <span className="text-2xl font-bold">{FormatNumber(lavaAmount)}</span>
            <span className="text-lg ml-2" style={{ marginBottom: '1px' }}>LAVA</span>
        </div>
    );
};

export default ProviderCards;