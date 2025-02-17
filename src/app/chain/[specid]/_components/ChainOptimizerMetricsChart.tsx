"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
    ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Brush
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@jsinfo/components/shadcn/ui/Card";
import { useJsinfobeFetchWithDeps } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import DropDownRadioOptions from "@jsinfo/components/shadcn/DropDownRadioOptions";
import { CalendarWithLastXButtons } from "@jsinfo/components/shadcn/CalendarWithLastXButtons";
import { Popover, PopoverContent, PopoverTrigger } from "@jsinfo/components/shadcn/ui/Popover";
import { Button } from "@jsinfo/components/shadcn/ui/Button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@jsinfo/lib/css";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { DateRange } from "react-day-picker";
import { ProviderPicker } from './ChainProviderPicker';
import { useSearchParams } from 'next/navigation';

interface MetricsResponse {
    metrics: Array<{
        provider_moniker: string;
        hourly_timestamp: string;
        score: number;
        metric_type: string;
        tier_average?: number;
        tier_chances_tier0?: number;
        tier_chances_tier1?: number;
        tier_chances_tier2?: number;
        tier_chances_tier3?: number;
    }>;
    filters?: {
        options?: {
            metrics: Record<string, string>;
            providers: {
                top: Record<string, string>;
                all: Record<string, string>;
            };
            consumers: {
                lavaIds: string[];
                hostnames: string[];
            };
        };
        selected: {
            metric: string;
            providers: string[];
            consumer: string;
        };
    };
}

interface ConsumerOption {
    value: string;
    label: string;
    displayLabel?: string;
    group?: string;
}

const COLORS = [
    '#FF9F9F', '#6EE7B7', '#93C5FD', '#FCD34D', '#C4B5FD',
    '#FDA4AF', '#A78BFA', '#F472B6', '#60A5FA', '#34D399'
];

interface ChainOptimizerMetricsChartProps {
    specId: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 border rounded-lg shadow-lg p-3">
            <p className="font-medium text-sm mb-2">{format(label, 'PPpp')}</p>
            <div className="space-y-1.5">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">{entry.name}:</span>
                        <span className="text-sm font-medium">{Number(entry.value).toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function ChainOptimizerMetricsChart({ specId }: ChainOptimizerMetricsChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>('generic_score');
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [selectedConsumer, setSelectedConsumer] = useState<string>('all');
    const [uiDateRange, setUiDateRange] = useState<DateRange>({
        from: subDays(new Date(), 2),
        to: new Date(),
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [tempDateRange, setTempDateRange] = useState(uiDateRange);
    const [showAllProviders, setShowAllProviders] = useState(true);
    const searchParams = useSearchParams();
    const key = searchParams.get('key');
    const [isFullMode] = useState(!!key);

    const { data: rawData, error, isLoading } = useJsinfobeFetchWithDeps<MetricsResponse>(() => {
        if (!uiDateRange.from || !uiDateRange.to) return '';

        const params = new URLSearchParams({
            f: format(uiDateRange.from, "yyyy-MM-dd'Z'"),
            t: format(uiDateRange.to, "yyyy-MM-dd'Z'"),
            consumer: selectedConsumer,
            metric: selectedMetric,
            providers: selectedProviders.join(',')
        });

        const endpoint = key
            ? `specConsumerOptimizerMetricsFull/${specId}`
            : `specConsumerOptimizerMetrics/${specId}`;

        return `${endpoint}?${params.toString()}${key ? `&key=${key}` : ''}`;
    }, [specId, uiDateRange, selectedConsumer, selectedMetric, selectedProviders, key]);

    const metricOptions = useMemo(() => {
        if (!rawData?.filters?.options?.metrics) return [];

        const baseMetrics = Object.entries(rawData.filters.options.metrics).map(([value, label]) => ({
            value,
            label
        }));

        if (!isFullMode) return baseMetrics;

        return [
            ...baseMetrics,
            { value: 'tier_average', label: 'Tier Average' },
            { value: 'tier_chances_tier0', label: 'Tier 0 Chance' },
            { value: 'tier_chances_tier1', label: 'Tier 1 Chance' },
            { value: 'tier_chances_tier2', label: 'Tier 2 Chance' },
            { value: 'tier_chances_tier3', label: 'Tier 3 Chance' }
        ];
    }, [rawData, isFullMode]);

    const consumerOptions = useMemo<ConsumerOption[]>(() => {
        if (!rawData?.filters?.options?.consumers) return [];

        const trimText = (text: string) =>
            text.length > 16 ? text.slice(0, 16) + '...' : text;

        return [
            { value: 'all', label: 'All Consumers' },
            ...rawData.filters.options.consumers.lavaIds.map(lavaId => ({
                value: lavaId,
                label: lavaId,
                displayLabel: trimText(lavaId),
                group: 'Lava IDs'
            })),
            ...rawData.filters.options.consumers.hostnames.map(hostname => ({
                value: hostname,
                label: hostname,
                displayLabel: trimText(hostname),
                group: 'Hostnames'
            }))
        ];
    }, [rawData]);

    const chartData = useMemo(() => {
        if (!rawData?.metrics) return [];

        const groupedData = rawData.metrics.reduce((acc, metric) => {
            const timestamp = new Date(metric.hourly_timestamp).getTime();
            if (!acc[timestamp]) {
                acc[timestamp] = { timestamp };
            }

            if (metric.provider_moniker === "All Providers") {
                if (showAllProviders) {
                    acc[timestamp]["All Providers"] = metric.score;
                }
            } else {
                acc[timestamp][metric.provider_moniker] = metric.score;
            }

            return acc;
        }, {} as Record<number, any>);

        return Object.values(groupedData).sort((a, b) => a.timestamp - b.timestamp);
    }, [rawData, showAllProviders]);

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        if (range) {
            setTempDateRange(range);
        }
    };

    const handleCalendarCancel = () => {
        setTempDateRange(uiDateRange);
        setIsCalendarOpen(false);
    };

    const handleCalendarClose = () => {
        setUiDateRange(tempDateRange);
        setIsCalendarOpen(false);
    };

    const handleAllProvidersClick = () => {
        setShowAllProviders(prev => !prev);
    };

    // Add a ref to track if we've already set initial providers
    const initialProvidersSet = React.useRef(false);

    useEffect(() => {
        // Only set initial providers once when they become available
        if (
            !initialProvidersSet.current &&
            rawData?.filters?.options?.providers?.top &&
            selectedProviders.length === 0
        ) {
            const topProviderIds = Object.keys(rawData.filters.options.providers.top);
            setSelectedProviders(topProviderIds);
            initialProvidersSet.current = true;
        }
    }, [rawData?.filters?.options?.providers?.top]);

    // Add loading overlay component
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingIndicator
                loadingText="Updating metrics data"
                greyText="metrics"
            />
        </div>
    );

    // Add this component for the no data message
    const NoDataMessage = () => (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No data to show for selected filters
        </div>
    );

    // Fix the no data check
    const hasData = rawData?.metrics && rawData.metrics.length > 0;

    if (error) {
        return (
            <Card className="min-h-[600px]">
                <div className="flex items-center justify-center h-full p-8">
                    <div className="text-destructive">Error loading metrics data</div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative">
            {isLoading && <LoadingOverlay />}
            <CardHeader>
                <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <CardTitle>Chain's Consumer Optimizer Metrics
                                <ModernTooltip title="Metrics showing provider performance for this chain">
                                    <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer ml-2" />
                                </ModernTooltip>
                            </CardTitle>
                            <CardDescription>
                                Provider scores and ranks as reported from the chain's consumers
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {/* First row */}
                        <div className="grid grid-cols-1 min-[1000px]:grid-cols-2 gap-4">
                            <ProviderPicker
                                providers={rawData?.filters?.options?.providers}
                                selectedProviders={selectedProviders}
                                onProvidersChange={setSelectedProviders}
                            />
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !uiDateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {uiDateRange?.from ? (
                                            uiDateRange.to ? (
                                                <>
                                                    {format(uiDateRange.from, "LLL dd, y")} -{" "}
                                                    {format(uiDateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(uiDateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <CalendarWithLastXButtons
                                        selected={tempDateRange}
                                        onSelect={handleDateRangeSelect}
                                    />
                                    <div className="flex justify-end gap-2 p-3">
                                        <Button variant="outline" onClick={handleCalendarCancel}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCalendarClose}>
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Second row */}
                        <div className="grid grid-cols-1 min-[1000px]:grid-cols-2 gap-4">
                            <DropDownRadioOptions
                                options={metricOptions}
                                value={selectedMetric}
                                setValue={setSelectedMetric}
                                placeholder="Select metric"
                                className="w-full"
                            />
                            <DropDownRadioOptions
                                options={consumerOptions}
                                value={selectedConsumer}
                                setValue={setSelectedConsumer}
                                placeholder="Select consumer"
                                className="w-full"
                                displayValue={(value) =>
                                    consumerOptions.find(opt => opt.value === value)?.displayLabel ||
                                    consumerOptions.find(opt => opt.value === value)?.label ||
                                    'Select consumer'
                                }
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] relative">
                    {!hasData ? (
                        <NoDataMessage />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(timestamp) => format(new Date(timestamp), 'dd MMM HH:mm')}
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tickFormatter={(value) => value.toFixed(2)}
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    key="all-providers"
                                    type="monotone"
                                    dataKey="All Providers"
                                    stroke={COLORS[COLORS.length - 1]}
                                    name="All Providers Average"
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 4, strokeWidth: 1 }}
                                />
                                {selectedProviders.map((providerId, index) => {
                                    const moniker = rawData?.filters?.options?.providers?.all[providerId] ||
                                        rawData?.filters?.options?.providers?.top[providerId];
                                    if (!moniker) return null;

                                    return (
                                        <Line
                                            key={providerId}
                                            type="monotone"
                                            dataKey={moniker}
                                            stroke={COLORS[index % COLORS.length]}
                                            name={moniker}
                                            dot={{ r: 2 }}
                                            activeDot={{ r: 4, strokeWidth: 1 }}
                                        />
                                    );
                                })}
                                <Brush
                                    dataKey="timestamp"
                                    height={30}
                                    stroke="hsl(var(--muted-foreground))"
                                    fill="hsl(var(--background))"
                                    tickFormatter={(timestamp) => format(new Date(timestamp), 'dd MMM')}
                                    travellerWidth={8}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Always show legend, regardless of data */}
                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Top 10 Chain Providers And All Providers Average</h3>
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 text-xs">
                        {/* Always show All Providers Average */}
                        <div
                            className={`flex items-center gap-2 p-2 rounded-md border border-border/50 
                                ${showAllProviders ? 'bg-card/50' : 'bg-muted/50'} 
                                hover:bg-card transition-all duration-200 cursor-pointer`}
                            onClick={handleAllProvidersClick}
                        >
                            <div
                                className={`w-2 h-2 rounded-full ${showAllProviders ? 'opacity-100' : 'opacity-50'}`}
                                style={{
                                    backgroundColor: COLORS[COLORS.length - 1],
                                    boxShadow: showAllProviders
                                        ? `0 0 0.5rem ${COLORS[COLORS.length - 1]}25`
                                        : 'none'
                                }}
                            />
                            <div className="flex flex-col flex-1">
                                <span className={`text-sm transition-colors duration-200 ${showAllProviders
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                                    }`}>
                                    All Providers Average
                                </span>
                                <span className="text-[10px] text-muted-foreground">Average of all providers</span>
                            </div>
                        </div>

                        {/* Show top providers if available */}
                        {rawData?.filters?.options?.providers?.top &&
                            Object.entries(rawData.filters.options.providers.top).map(([providerId, providerName], index) => (
                                <div
                                    key={providerId}
                                    className={`flex items-center gap-2 p-2 rounded-md border border-border/50 
                                        ${selectedProviders.includes(providerId) ? 'bg-card/50' : 'bg-muted/50'} 
                                        hover:bg-card transition-all duration-200 cursor-pointer`}
                                    onClick={() => {
                                        setSelectedProviders(prev =>
                                            prev.includes(providerId)
                                                ? prev.filter(id => id !== providerId)
                                                : [...prev, providerId]
                                        );
                                    }}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${selectedProviders.includes(providerId) ? 'opacity-100' : 'opacity-50'
                                            }`}
                                        style={{
                                            backgroundColor: COLORS[index % COLORS.length],
                                            boxShadow: selectedProviders.includes(providerId)
                                                ? `0 0 0.5rem ${COLORS[index % COLORS.length]}25`
                                                : 'none'
                                        }}
                                    />
                                    <div className="flex flex-col flex-1">
                                        <span className={`text-sm transition-colors duration-200 ${selectedProviders.includes(providerId)
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                            }`}>
                                            {providerName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground break-all">
                                            {providerId}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default ChainOptimizerMetricsChart; 