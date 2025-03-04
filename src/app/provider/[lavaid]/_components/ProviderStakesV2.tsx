"use client";

import React, { useState } from 'react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import LoadingIndicator from '@jsinfo/components/modern/LoadingIndicator';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@jsinfo/components/shadcn/ui2/Table";
import { Badge } from "@jsinfo/components/shadcn/ui/Badge";
import { Button } from "@jsinfo/components/shadcn/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "./ProviderStakesV2Tabs";
import LavaWithTooltip from '@jsinfo/components/modern/LavaWithTooltip';
import { FormatNumber } from '@jsinfo/lib/formatting';
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';
import { GeoLocationToString } from '@jsinfo/lib/convertors';

interface ProviderStakeData {
    stake: string;
    delegateTotal: string;
    delegateCommission: string;
    totalStake: string;
    appliedHeight: number;
    geolocation: number;
    addons: string;
    extensions: string;
    status: number;
    statusString: string;
    provider: string;
    specId: string;
    blockId: number;
    chainName: string;
    chainIcon: string;
    moniker: string;
    monikerfull: string;
    providerAvatar?: string;
    cuSum30Days: number | string;
    cuSum90Days: number | string;
    relaySum30Days: number | string;
    relaySum90Days: number | string;
    rewards: {
        lava: string;
        usd: string;
    } | string;
    health: {
        overallStatus: string;
        interfaces: string[];
        lastTimestamp: string;
        interfaceDetails: Record<string, any>;
    } | string;
}

interface ProviderStakesResponse {
    data: ProviderStakeData[];
}

const HealthStatusBadge = ({ health }: { health: ProviderStakeData['health'] }) => {
    if (typeof health === 'string') {
        return <Badge variant="outline" className="bg-gray-100 text-gray-500">N/A</Badge>;
    }

    const status = health.overallStatus.toLowerCase();
    const interfaces = health.interfaces || [];
    const lastCheck = new Date(health.lastTimestamp).toLocaleString();

    const tooltipContent = `status: ${status}
last check: ${lastCheck}
interfaces: ${interfaces.join(', ') || 'none'}
${Object.entries(health.interfaceDetails || {}).map(([k, v]) =>
        `${k}: ${v.status || 'unknown'}${v.message ? ` (${v.message})` : ''}${v.region ? ` [${v.region}]` : ''}`
    ).join('\n')}`;

    const getBadge = () => {
        switch (status) {
            case 'healthy':
                return <Badge variant="outline" className="bg-green-100 text-green-700">Healthy</Badge>;
            case 'unhealthy':
                return <Badge variant="outline" className="bg-red-100 text-red-700">Unhealthy</Badge>;
            case 'warning':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Warning</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-100 text-gray-500">{status}</Badge>;
        }
    };

    return (
        <ModernTooltip title={tooltipContent}>
            {getBadge()}
        </ModernTooltip>
    );
};

const RewardsCell = ({ rewards }: { rewards: ProviderStakeData['rewards'] }) => {
    if (typeof rewards === 'string') {
        return <span className="text-gray-500">-</span>;
    }

    return (
        <ModernTooltip title={`USD value: ${rewards.usd}`}>
            <span>{rewards.lava} LAVA</span>
        </ModernTooltip>
    );
};

const CUCell = ({ cuData, relayData }: { cuData: number | string, relayData: number | string }) => {
    if (cuData === 0 || typeof cuData === 'string') {
        return <span className="text-gray-500">-</span>;
    }

    return (
        <ModernTooltip title={`Compute Units: ${FormatNumber(Number(cuData))}\nRelays: ${FormatNumber(Number(relayData))}`}>
            <span>{FormatNumber(Number(cuData) / 1000)}K</span>
        </ModernTooltip>
    );
};

// Add a function to check if all rewards are empty
const hasAnyRewardsData = (stakes: ProviderStakeData[]) => {
    return stakes.some(stake =>
        typeof stake.rewards !== 'string' &&
        stake.rewards.lava !== '0' &&
        stake.rewards.lava !== '-'
    );
};

export default function ProviderStakesV2({ providerId }: { providerId: string }) {
    const [activeFilter, setActiveFilter] = useState<'active' | 'inactive'>('active');
    const [dataView, setDataView] = useState<'stake' | 'performance'>('stake');
    const [sortField, setSortField] = useState<keyof ProviderStakeData | 'rewardsUsd'>('totalStake');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const { data, error, isLoading } = useJsinfobeFetch<ProviderStakesResponse>(
        `providerStakesV2/${providerId}`
    );

    if (isLoading) {
        return <LoadingIndicator loadingText="Loading provider stakes" />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="p-6 border border-gray-700 rounded-md text-center bg-gray-900 shadow-md">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="text-base font-medium text-gray-300">No services available</h3>
                </div>
            </div>
        );
    }

    const activeStakes = data.data.filter(stake => stake.statusString === 'Active');
    const inactiveStakes = data.data.filter(stake => stake.statusString !== 'Active');

    const sortData = (data: ProviderStakeData[]) => {
        return [...data].sort((a, b) => {
            let aValue: any = a[sortField as keyof ProviderStakeData];
            let bValue: any = b[sortField as keyof ProviderStakeData];

            // Handle numeric strings
            if (sortField === 'totalStake' || sortField === 'stake' || sortField === 'delegateTotal') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            // Handle rewards special case
            if (sortField === 'rewards') {
                // Extract lava value as number for sorting
                aValue = typeof a.rewards === 'string' ? 0 : parseFloat(a.rewards.lava);
                bValue = typeof b.rewards === 'string' ? 0 : parseFloat(b.rewards.lava);
            }

            // Handle rewardsUsd special case
            if (sortField === 'rewardsUsd') {
                // Extract USD value as number for sorting (remove $ and parse)
                aValue = typeof a.rewards === 'string' ? 0 :
                    parseFloat(a.rewards.usd.replace('$', '').replace(',', ''));
                bValue = typeof b.rewards === 'string' ? 0 :
                    parseFloat(b.rewards.usd.replace('$', '').replace(',', ''));
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSortChange = (field: keyof ProviderStakeData | 'rewardsUsd') => {
        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const displayStakes = sortData(
        activeFilter === 'active' ? activeStakes : inactiveStakes
    );

    // Inside the render section, calculate if we should show rewards
    const showRewardsColumns = hasAnyRewardsData(displayStakes);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-muted rounded-lg p-1 inline-flex">
                    <Button
                        variant={activeFilter === 'active' ? "default" : "ghost"}
                        className={`rounded-md text-sm ${activeFilter === 'active' ? '' : 'hover:bg-muted-foreground/10'}`}
                        onClick={() => setActiveFilter('active')}
                    >
                        Active Services ({activeStakes.length})
                    </Button>
                    <Button
                        variant={activeFilter === 'inactive' ? "default" : "ghost"}
                        className={`rounded-md text-sm ${activeFilter === 'inactive' ? '' : 'hover:bg-muted-foreground/10'}`}
                        onClick={() => setActiveFilter('inactive')}
                    >
                        Inactive Services ({inactiveStakes.length})
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Tabs value={dataView} onValueChange={(v) => setDataView(v as 'stake' | 'performance')} className="w-auto mx-4">
                        <TabsList className="grid w-[300px] grid-cols-2">
                            <TabsTrigger value="stake" className="px-6">Stake Data</TabsTrigger>
                            <TabsTrigger value="performance" className="px-6">Performance Data</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {activeFilter === 'active' && dataView === 'stake' && (
                displayStakes.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('specId')}>
                                        <ModernTooltip title="The blockchain network this provider serves">
                                            <span>Chain {sortField === 'specId' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('totalStake')}>
                                        <ModernTooltip title="Total amount of LAVA staked (self stake + delegations)">
                                            <span>Total Stake {sortField === 'totalStake' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('stake')}>
                                        <ModernTooltip title="Amount staked by the provider directly">
                                            <span>Self Stake {sortField === 'stake' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('delegateTotal')}>
                                        <ModernTooltip title="Amount delegated by users to this provider">
                                            <span>Delegations {sortField === 'delegateTotal' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('delegateCommission')}>
                                        <ModernTooltip title="Percentage fee charged by the provider on delegator rewards">
                                            <span>Commission {sortField === 'delegateCommission' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('appliedHeight')}>
                                        <ModernTooltip title="Block height when the stake was last applied">
                                            <span>Applied Height {sortField === 'appliedHeight' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    {showRewardsColumns && (
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange('rewards')}>
                                            <ModernTooltip title="Rewards distributed last month in LAVA tokens">
                                                <span>Rewards (LAVA) {sortField === 'rewards' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                            </ModernTooltip>
                                        </TableHead>
                                    )}
                                    {showRewardsColumns && (
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange('rewardsUsd')}>
                                            <ModernTooltip title="USD value of rewards distributed last month">
                                                <span>Rewards (USD) {sortField === 'rewardsUsd' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                            </ModernTooltip>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStakes.map((stake, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {stake.chainIcon && (
                                                    <div className={`w-6 h-6 relative flex-shrink-0 rounded-full overflow-hidden ${(activeFilter as string) === 'inactive' ? 'opacity-70' : ''}`}>
                                                        <img
                                                            src={stake.chainIcon}
                                                            alt={stake.chainName}
                                                            width={24}
                                                            height={24}
                                                            style={{ objectFit: 'contain', filter: (activeFilter as string) === 'inactive' ? 'grayscale(30%)' : 'none' }}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/chain/${stake.specId}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {stake.chainName}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{stake.specId}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.totalStake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.stake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.delegateTotal} />
                                        </TableCell>
                                        <TableCell>
                                            {stake.delegateCommission}%
                                        </TableCell>
                                        <TableCell>
                                            {stake.appliedHeight > 0 ? FormatNumber(stake.appliedHeight) : "-"}
                                        </TableCell>
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards">
                                                    {typeof stake.rewards === 'string' ? '-' : FormatNumber(parseFloat(stake.rewards.lava))}
                                                </ModernTooltip>
                                            </TableCell>
                                        )}
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards in USD">
                                                    {typeof stake.rewards === 'string' ? '-' : stake.rewards.usd}
                                                </ModernTooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-6 border border-gray-700 rounded-md text-center bg-gray-900 shadow-md">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="text-base font-medium text-gray-300">No active services</h3>
                        </div>
                    </div>
                )
            )}

            {activeFilter === 'active' && dataView === 'performance' && (
                displayStakes.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('specId')}>
                                        <ModernTooltip title="The blockchain network this provider serves">
                                            <span>Chain {sortField === 'specId' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('geolocation')}>
                                        <ModernTooltip title="Geographic region where the service is hosted">
                                            <span>Location {sortField === 'geolocation' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('cuSum30Days')}>
                                        <ModernTooltip title="Compute Units processed in the last 30 days">
                                            <span>CU (30d) {sortField === 'cuSum30Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('cuSum90Days')}>
                                        <ModernTooltip title="Compute Units processed in the last 90 days">
                                            <span>CU (90d) {sortField === 'cuSum90Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('relaySum30Days')}>
                                        <ModernTooltip title="Number of relays processed in the last 30 days">
                                            <span>Relays (30d) {sortField === 'relaySum30Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('relaySum90Days')}>
                                        <ModernTooltip title="Number of relays processed in the last 90 days">
                                            <span>Relays (90d) {sortField === 'relaySum90Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead>
                                        <ModernTooltip title="Current health status of the provider's service">
                                            <span>Health</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead>
                                        <ModernTooltip title="Special functionality provided by this service">
                                            <span>Addons/Extensions</span>
                                        </ModernTooltip>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStakes.map((stake, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {stake.chainIcon && (
                                                    <div className={`w-6 h-6 relative flex-shrink-0 rounded-full overflow-hidden ${(activeFilter as string) === 'inactive' ? 'opacity-70' : ''}`}>
                                                        <img
                                                            src={stake.chainIcon}
                                                            alt={stake.chainName}
                                                            width={24}
                                                            height={24}
                                                            style={{ objectFit: 'contain', filter: (activeFilter as string) === 'inactive' ? 'grayscale(30%)' : 'none' }}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/chain/${stake.specId}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {stake.chainName}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{stake.specId}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ModernTooltip title={`Geolocation code: ${stake.geolocation}`}>
                                                <span>{GeoLocationToString(stake.geolocation)}</span>
                                            </ModernTooltip>
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.cuSum30Days === 'number' && stake.cuSum30Days > 0) ||
                                                (typeof stake.cuSum30Days === 'string' && parseFloat(stake.cuSum30Days) > 0) ?
                                                FormatNumber(typeof stake.cuSum30Days === 'string' ?
                                                    parseFloat(stake.cuSum30Days) : stake.cuSum30Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.cuSum90Days === 'number' && stake.cuSum90Days > 0) ||
                                                (typeof stake.cuSum90Days === 'string' && parseFloat(stake.cuSum90Days) > 0) ?
                                                FormatNumber(typeof stake.cuSum90Days === 'string' ?
                                                    parseFloat(stake.cuSum90Days) : stake.cuSum90Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.relaySum30Days === 'number' && stake.relaySum30Days > 0) ||
                                                (typeof stake.relaySum30Days === 'string' && parseFloat(stake.relaySum30Days) > 0) ?
                                                FormatNumber(typeof stake.relaySum30Days === 'string' ?
                                                    parseFloat(stake.relaySum30Days) : stake.relaySum30Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.relaySum90Days === 'number' && stake.relaySum90Days > 0) ||
                                                (typeof stake.relaySum90Days === 'string' && parseFloat(stake.relaySum90Days) > 0) ?
                                                FormatNumber(typeof stake.relaySum90Days === 'string' ?
                                                    parseFloat(stake.relaySum90Days) : stake.relaySum90Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <HealthStatusBadge health={stake.health} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                {stake.addons !== '-' && (
                                                    <Badge className="mr-1 bg-blue-100 text-blue-800 border-blue-200">
                                                        {stake.addons}
                                                    </Badge>
                                                )}
                                                {stake.extensions !== '-' && (
                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                        {stake.extensions}
                                                    </Badge>
                                                )}
                                                {(stake.addons === '-' && stake.extensions === '-') && (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-6 border border-gray-700 rounded-md text-center bg-gray-900 shadow-md">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="text-base font-medium text-gray-300">No active services</h3>
                        </div>
                    </div>
                )
            )}

            {activeFilter === 'inactive' && dataView === 'stake' && (
                displayStakes.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('specId')}>
                                        <ModernTooltip title="The blockchain network this provider serves">
                                            <span>Chain {sortField === 'specId' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('totalStake')}>
                                        <ModernTooltip title="Total amount of LAVA staked (self stake + delegations)">
                                            <span>Total Stake {sortField === 'totalStake' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('stake')}>
                                        <ModernTooltip title="Amount staked by the provider directly">
                                            <span>Self Stake {sortField === 'stake' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('delegateTotal')}>
                                        <ModernTooltip title="Amount delegated by users to this provider">
                                            <span>Delegations {sortField === 'delegateTotal' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('delegateCommission')}>
                                        <ModernTooltip title="Percentage fee charged by the provider on delegator rewards">
                                            <span>Commission {sortField === 'delegateCommission' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('appliedHeight')}>
                                        <ModernTooltip title="Block height when the stake was last applied">
                                            <span>Applied Height {sortField === 'appliedHeight' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    {showRewardsColumns && (
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange('rewards')}>
                                            <ModernTooltip title="Rewards distributed last month in LAVA tokens">
                                                <span>Rewards (LAVA) {sortField === 'rewards' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                            </ModernTooltip>
                                        </TableHead>
                                    )}
                                    {showRewardsColumns && (
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange('rewardsUsd')}>
                                            <ModernTooltip title="USD value of rewards distributed last month">
                                                <span>Rewards (USD) {sortField === 'rewardsUsd' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                            </ModernTooltip>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStakes.map((stake, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {stake.chainIcon && (
                                                    <div className={`w-6 h-6 relative flex-shrink-0 rounded-full overflow-hidden ${(activeFilter as string) === 'inactive' ? 'opacity-70' : ''}`}>
                                                        <img
                                                            src={stake.chainIcon}
                                                            alt={stake.chainName}
                                                            width={24}
                                                            height={24}
                                                            style={{ objectFit: 'contain', filter: (activeFilter as string) === 'inactive' ? 'grayscale(30%)' : 'none' }}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/chain/${stake.specId}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {stake.chainName}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{stake.specId}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.totalStake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.stake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={stake.delegateTotal} />
                                        </TableCell>
                                        <TableCell>
                                            {stake.delegateCommission}%
                                        </TableCell>
                                        <TableCell>
                                            {stake.appliedHeight > 0 ? FormatNumber(stake.appliedHeight) : "-"}
                                        </TableCell>
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards">
                                                    {typeof stake.rewards === 'string' ? '-' : FormatNumber(parseFloat(stake.rewards.lava))}
                                                </ModernTooltip>
                                            </TableCell>
                                        )}
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards in USD">
                                                    {typeof stake.rewards === 'string' ? '-' : stake.rewards.usd}
                                                </ModernTooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-6 border border-gray-700 rounded-md text-center bg-gray-900 shadow-md">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="text-base font-medium text-gray-300">No inactive services</h3>
                        </div>
                    </div>
                )
            )}

            {activeFilter === 'inactive' && dataView === 'performance' && (
                displayStakes.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('specId')}>
                                        <ModernTooltip title="The blockchain network this provider serves">
                                            <span>Chain {sortField === 'specId' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('geolocation')}>
                                        <ModernTooltip title="Geographic region where the service is hosted">
                                            <span>Location {sortField === 'geolocation' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('cuSum30Days')}>
                                        <ModernTooltip title="Compute Units processed in the last 30 days">
                                            <span>CU (30d) {sortField === 'cuSum30Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('cuSum90Days')}>
                                        <ModernTooltip title="Compute Units processed in the last 90 days">
                                            <span>CU (90d) {sortField === 'cuSum90Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('relaySum30Days')}>
                                        <ModernTooltip title="Number of relays processed in the last 30 days">
                                            <span>Relays (30d) {sortField === 'relaySum30Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('relaySum90Days')}>
                                        <ModernTooltip title="Number of relays processed in the last 90 days">
                                            <span>Relays (90d) {sortField === 'relaySum90Days' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead>
                                        <ModernTooltip title="Current health status of the provider's service">
                                            <span>Health</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead>
                                        <ModernTooltip title="Special functionality provided by this service">
                                            <span>Addons/Extensions</span>
                                        </ModernTooltip>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStakes.map((stake, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {stake.chainIcon && (
                                                    <div className={`w-6 h-6 relative flex-shrink-0 rounded-full overflow-hidden ${(activeFilter as string) === 'inactive' ? 'opacity-70' : ''}`}>
                                                        <img
                                                            src={stake.chainIcon}
                                                            alt={stake.chainName}
                                                            width={24}
                                                            height={24}
                                                            style={{ objectFit: 'contain', filter: (activeFilter as string) === 'inactive' ? 'grayscale(30%)' : 'none' }}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/chain/${stake.specId}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {stake.chainName}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{stake.specId}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ModernTooltip title={`Geolocation code: ${stake.geolocation}`}>
                                                <span>{GeoLocationToString(stake.geolocation)}</span>
                                            </ModernTooltip>
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.cuSum30Days === 'number' && stake.cuSum30Days > 0) ||
                                                (typeof stake.cuSum30Days === 'string' && parseFloat(stake.cuSum30Days) > 0) ?
                                                FormatNumber(typeof stake.cuSum30Days === 'string' ?
                                                    parseFloat(stake.cuSum30Days) : stake.cuSum30Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.cuSum90Days === 'number' && stake.cuSum90Days > 0) ||
                                                (typeof stake.cuSum90Days === 'string' && parseFloat(stake.cuSum90Days) > 0) ?
                                                FormatNumber(typeof stake.cuSum90Days === 'string' ?
                                                    parseFloat(stake.cuSum90Days) : stake.cuSum90Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.relaySum30Days === 'number' && stake.relaySum30Days > 0) ||
                                                (typeof stake.relaySum30Days === 'string' && parseFloat(stake.relaySum30Days) > 0) ?
                                                FormatNumber(typeof stake.relaySum30Days === 'string' ?
                                                    parseFloat(stake.relaySum30Days) : stake.relaySum30Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof stake.relaySum90Days === 'number' && stake.relaySum90Days > 0) ||
                                                (typeof stake.relaySum90Days === 'string' && parseFloat(stake.relaySum90Days) > 0) ?
                                                FormatNumber(typeof stake.relaySum90Days === 'string' ?
                                                    parseFloat(stake.relaySum90Days) : stake.relaySum90Days) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <HealthStatusBadge health={stake.health} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                {stake.addons !== '-' && (
                                                    <Badge className="mr-1 bg-blue-100 text-blue-800 border-blue-200">
                                                        {stake.addons}
                                                    </Badge>
                                                )}
                                                {stake.extensions !== '-' && (
                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                        {stake.extensions}
                                                    </Badge>
                                                )}
                                                {(stake.addons === '-' && stake.extensions === '-') && (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-6 border border-gray-700 rounded-md text-center bg-gray-900 shadow-md">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="text-base font-medium text-gray-300">No inactive services</h3>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}