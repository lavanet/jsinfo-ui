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
import { Tabs, TabsList, TabsTrigger } from "./ChainStakesV2Tabs";
import LavaWithTooltip from '@jsinfo/components/modern/LavaWithTooltip';
import { FormatNumber } from '@jsinfo/lib/formatting';
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';
import { GeoLocationToString } from '@jsinfo/lib/convertors';
import { Avatar, AvatarFallback, AvatarImage } from "@jsinfo/components/shadcn/ui/Avatar";

// Defines the provider data structure from the API
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

const CUCell = ({ cuData, relayData }: { cuData: number | string, relayData: number | string }) => {
    if (cuData === 0 || typeof cuData === 'string' && parseFloat(cuData) === 0) {
        return <span className="text-gray-500">-</span>;
    }

    return (
        <ModernTooltip title={`Compute Units: ${FormatNumber(Number(cuData))}\nRelays: ${FormatNumber(Number(relayData))}`}>
            <span>{FormatNumber(Number(cuData) / 1000)}K</span>
        </ModernTooltip>
    );
};

// Function to check if any providers have rewards data
const hasAnyRewardsData = (stakes: ProviderStakeData[]) => {
    return stakes.some(stake =>
        typeof stake.rewards !== 'string' &&
        stake.rewards.lava !== '0' &&
        stake.rewards.lava !== '-'
    );
};

export default function ChainStakesV2({ specId }: { specId: string }) {
    const [activeFilter, setActiveFilter] = useState<'active' | 'inactive'>('active');
    const [dataView, setDataView] = useState<'stake' | 'performance'>('stake');
    const [sortField, setSortField] = useState<keyof ProviderStakeData | 'rewardsLava' | 'rewardsUsd' | 'addonsExtensions'>('totalStake');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Fetch provider stakes for this specific chain
    const { data, error, isLoading } = useJsinfobeFetch<ProviderStakeData[]>(
        `specStakesV2/${specId}`
    );

    if (isLoading) {
        return <LoadingIndicator loadingText="Loading chain providers" />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (!data || data.length === 0) {
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
                    <h3 className="text-base font-medium text-gray-300">No providers available for this chain</h3>
                </div>
            </div>
        );
    }

    const activeProviders = data.filter(provider => provider.statusString === 'Active');
    const inactiveProviders = data.filter(provider => provider.statusString !== 'Active');

    const sortData = (data: ProviderStakeData[]) => {
        return [...data].sort((a, b) => {
            let aValue: any = a[sortField as keyof ProviderStakeData];
            let bValue: any = b[sortField as keyof ProviderStakeData];

            // Handle numeric string fields
            if (sortField === 'totalStake' || sortField === 'stake' || sortField === 'delegateTotal') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            // Handle CU and relay fields
            if (sortField === 'cuSum30Days' || sortField === 'cuSum90Days' ||
                sortField === 'relaySum30Days' || sortField === 'relaySum90Days') {
                // Convert string to number, handling empty or invalid values
                aValue = typeof aValue === 'string' ? parseFloat(aValue) || 0 : (aValue || 0);
                bValue = typeof bValue === 'string' ? parseFloat(bValue) || 0 : (bValue || 0);
            }

            // Handle rewards special cases
            if (sortField === 'rewardsLava') {
                aValue = typeof a.rewards === 'string' ? 0 : parseFloat(a.rewards.lava);
                bValue = typeof b.rewards === 'string' ? 0 : parseFloat(b.rewards.lava);
            }

            if (sortField === 'rewardsUsd') {
                aValue = typeof a.rewards === 'string' ? 0 :
                    parseFloat(a.rewards.usd.replace('$', '').replace(',', ''));
                bValue = typeof b.rewards === 'string' ? 0 :
                    parseFloat(b.rewards.usd.replace('$', '').replace(',', ''));
            }

            // Handle health status sorting
            if (sortField === 'health') {
                const healthPriority = {
                    'healthy': 4,
                    'warning': 3,
                    'unhealthy': 2,
                    'frozen': 1,
                    'N/A': 0
                };

                const getHealthStatus = (health: ProviderStakeData['health']) => {
                    if (typeof health === 'string') return 'N/A';
                    return health.overallStatus.toLowerCase();
                };

                aValue = healthPriority[getHealthStatus(a.health) as keyof typeof healthPriority];
                bValue = healthPriority[getHealthStatus(b.health) as keyof typeof healthPriority];
            }

            // Handle addons/extensions sorting
            if (sortField === 'addonsExtensions') {
                const countFeatures = (provider: ProviderStakeData) => {
                    let count = 0;
                    if (provider.addons && provider.addons !== '-') {
                        count += provider.addons.split(',').length;
                    }
                    if (provider.extensions && provider.extensions !== '-') {
                        count += provider.extensions.split(',').length;
                    }
                    return count;
                };

                aValue = countFeatures(a);
                bValue = countFeatures(b);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSortChange = (field: keyof ProviderStakeData | 'rewardsLava' | 'rewardsUsd' | 'addonsExtensions') => {
        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const displayProviders = sortData(
        activeFilter === 'active' ? activeProviders : inactiveProviders
    );

    // Check if we should show rewards columns
    const showRewardsColumns = hasAnyRewardsData(displayProviders);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-muted rounded-lg p-1 inline-flex">
                    <Button
                        variant={activeFilter === 'active' ? "default" : "ghost"}
                        className={`rounded-md text-sm ${activeFilter === 'active' ? '' : 'hover:bg-muted-foreground/10'}`}
                        onClick={() => setActiveFilter('active')}
                    >
                        Active Providers ({activeProviders.length})
                    </Button>
                    <Button
                        variant={activeFilter === 'inactive' ? "default" : "ghost"}
                        className={`rounded-md text-sm ${activeFilter === 'inactive' ? '' : 'hover:bg-muted-foreground/10'}`}
                        onClick={() => setActiveFilter('inactive')}
                    >
                        Inactive Providers ({inactiveProviders.length})
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

            {/* Stake Data View */}
            {dataView === 'stake' && (
                displayProviders.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('moniker')}>
                                        <ModernTooltip title="Provider name">
                                            <span>Provider {sortField === 'moniker' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
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
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange('rewardsLava')}>
                                            <ModernTooltip title="Rewards distributed last month of LAVA tokens">
                                                <span>Rewards (LAVA) {sortField === 'rewardsLava' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
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
                                {displayProviders.map((provider, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {provider.providerAvatar ? (
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={provider.providerAvatar} alt={provider.moniker} />
                                                        <AvatarFallback>{provider.moniker.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                                        {provider.moniker.substring(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/provider/${provider.provider}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {provider.moniker}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[180px]" title={provider.provider}>
                                                        {provider.provider}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={provider.totalStake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={provider.stake} />
                                        </TableCell>
                                        <TableCell>
                                            <LavaWithTooltip amount={provider.delegateTotal} />
                                        </TableCell>
                                        <TableCell>
                                            {provider.delegateCommission}%
                                        </TableCell>
                                        <TableCell>
                                            {provider.appliedHeight > 0 ? FormatNumber(provider.appliedHeight) : "-"}
                                        </TableCell>
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards">
                                                    {typeof provider.rewards === 'string' ? '-' : FormatNumber(parseFloat(provider.rewards.lava))}
                                                </ModernTooltip>
                                            </TableCell>
                                        )}
                                        {showRewardsColumns && (
                                            <TableCell>
                                                <ModernTooltip title="Monthly rewards in USD">
                                                    {typeof provider.rewards === 'string' ? '-' : provider.rewards.usd}
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
                            <h3 className="text-base font-medium text-gray-300">
                                No {activeFilter} providers for this chain
                            </h3>
                        </div>
                    </div>
                )
            )}

            {/* Performance Data View */}
            {dataView === 'performance' && (
                displayProviders.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSortChange('moniker')}>
                                        <ModernTooltip title="Provider name">
                                            <span>Provider {sortField === 'moniker' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
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
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('health')}>
                                        <ModernTooltip title="Current health status of the provider's service">
                                            <span>Health {sortField === 'health' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('addonsExtensions')}>
                                        <ModernTooltip title="Special functionality provided by this service">
                                            <span>Addons/Extensions {sortField === 'addonsExtensions' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                                        </ModernTooltip>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayProviders.map((provider, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {provider.providerAvatar ? (
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={provider.providerAvatar} alt={provider.moniker} />
                                                        <AvatarFallback>{provider.moniker.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                                        {provider.moniker.substring(0, 2)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        <a
                                                            href={`/provider/${provider.provider}`}
                                                            className="text-orange-700 hover:text-orange-800 hover:underline"
                                                        >
                                                            {provider.moniker}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[180px]" title={provider.provider}>
                                                        {provider.provider}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ModernTooltip title={`Geolocation code: ${provider.geolocation}`}>
                                                <span>{GeoLocationToString(provider.geolocation)}</span>
                                            </ModernTooltip>
                                        </TableCell>
                                        <TableCell>
                                            <CUCell cuData={provider.cuSum30Days} relayData={provider.relaySum30Days} />
                                        </TableCell>
                                        <TableCell>
                                            <CUCell cuData={provider.cuSum90Days} relayData={provider.relaySum90Days} />
                                        </TableCell>
                                        <TableCell>
                                            {(typeof provider.relaySum30Days === 'number' && provider.relaySum30Days > 0) ||
                                                (typeof provider.relaySum30Days === 'string' && parseFloat(provider.relaySum30Days) > 0) ?
                                                FormatNumber(Number(provider.relaySum30Days)) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {(typeof provider.relaySum90Days === 'number' && provider.relaySum90Days > 0) ||
                                                (typeof provider.relaySum90Days === 'string' && parseFloat(provider.relaySum90Days) > 0) ?
                                                FormatNumber(Number(provider.relaySum90Days)) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <HealthStatusBadge health={provider.health} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-x-1">
                                                {provider.addons !== '-' && provider.addons.split(',').map((addon, idx) => (
                                                    <Badge key={`addon-${idx}`} className="mr-1 bg-blue-100 text-blue-800 border-blue-200">
                                                        {addon.trim()}
                                                    </Badge>
                                                ))}
                                                {provider.extensions !== '-' && provider.extensions.split(',').map((extension, idx) => (
                                                    <Badge key={`ext-${idx}`} className="bg-purple-100 text-purple-800 border-purple-200">
                                                        {extension.trim()}
                                                    </Badge>
                                                ))}
                                                {(provider.addons === '-' && provider.extensions === '-') && (
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
                            <h3 className="text-base font-medium text-gray-300">
                                No {activeFilter} providers for this chain
                            </h3>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}