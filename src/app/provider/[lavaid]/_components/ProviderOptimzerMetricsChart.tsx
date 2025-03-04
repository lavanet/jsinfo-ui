"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfDay, endOfDay, parseISO, isWithinInterval, subDays } from "date-fns";
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
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";

// Define types for the metrics data
interface TierChances {
  tier0: number;
  tier1: number;
  tier2: number;
  tier3: number;
}

interface BaseMetric {
  hourly_timestamp: string;
  consumer: string;
  chain_id: string;
  latency_score: number;
  availability_score: number;
  sync_score: number;
  node_error_rate: number;
  entry_index: number;
  generic_score: number;
  provider_stake: number;
  epoch: number;
}

interface FullMetric extends BaseMetric {
  tier_average: number;
  tier_chances: TierChances;
}

interface ChartDataPoint {
  timestamp: number;
  latency_score: number;
  availability_score: number;
  sync_score: number;
  node_error_rate: number;
  entry_index: number;
  generic_score: number;
}

interface MetricDefinition {
  label: string;
  dataKey: keyof Omit<ChartDataPoint, 'timestamp'>;
  color: string;
  description: string;
}

// Define metrics configuration with consistent colors and labels
const METRICS_CONFIG = {
  latency_score: {
    label: "Latency Score",
    color: "#0082FB",      // Changed to new blue
    description: "Lower is better. Average response time compared to other providers"
  },
  availability_score: {
    label: "Availability Score",
    color: "#00D7B0",      // Changed to teal
    description: "Higher is better. Percentage of successful responses over time"
  },
  sync_score: {
    label: "Sync Score",
    color: "#0EBA53",      // Changed to green
    description: "Lower is better. Measures block height difference from network average"
  },
  node_error_rate: {
    label: "Node Error Rate",
    color: "#1F4A30",      // Changed to dark green
    description: "Lower is better. Percentage of requests resulting in errors"
  },
  entry_index: {
    label: "Entry Index",
    color: "#7679FF",      // Changed to purple-blue
    description: "1 is best. Your ranking position among all active providers"
  },
  generic_score: {
    label: "Reputation Score",
    color: "#E76678",      // Changed to pink-red
    description: "Lower is better. Combined performance metric across all categories"
  }
} as const;

// Combine base and tier metrics configs
const ALL_METRICS_CONFIG = {
  ...METRICS_CONFIG,
  tier_average: {
    label: "Tier Average",
    color: "#EC25F4",      // Changed to magenta
    description: "Average tier position"
  },
  tier0: {
    label: "Tier 0 Chance",
    color: "#FF1D70",      // Changed to hot pink
    description: "Probability of reaching Tier 0"
  },
  tier1: {
    label: "Tier 1 Chance",
    color: "#FF3900",      // Changed to orange-red
    description: "Probability of reaching Tier 1"
  },
  tier2: {
    label: "Tier 2 Chance",
    color: "#FFBC0A",      // Changed to amber
    description: "Probability of reaching Tier 2"
  },
  tier3: {
    label: "Tier 3 Chance",
    color: "#0082FB",      // Reusing blue for last tier
    description: "Probability of reaching Tier 3"
  }
} as const;

type MetricKey = keyof typeof ALL_METRICS_CONFIG;

interface DateFormatterOptions {
  timestamp: number;
  index: number;
  showTime?: boolean;
}

const formatChartDate = ({ timestamp, index, showTime = false }: DateFormatterOptions): string => {
  if (index === 0) return '';
  const date = new Date(timestamp);
  const dateStr = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}`;
  if (!showTime) return dateStr;
  return `${dateStr} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

export function ProviderOptimizerMetricsChart({ providerId }: { providerId: string }) {
  const [uiConsumer, setUiConsumer] = useState("all");
  const [uiChainId, setUiChainId] = useState("all");
  const [uiDateRange, setUiDateRange] = useState<DateRange>({
    from: subDays(new Date(), 2),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(uiDateRange);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasEverHadData, setHasEverHadData] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Record<MetricKey, boolean>>(() => {
    return Object.keys(ALL_METRICS_CONFIG).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as Record<MetricKey, boolean>);
  });

  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const [isFullMode, setIsFullMode] = useState(false);

  const { data: rawData, error, isLoading, isValidating } = useJsinfobeFetchWithDeps<any>(() => {
    if (!uiDateRange.from || !uiDateRange.to) return '';

    const fromDate = format(uiDateRange.from, "yyyy-MM-dd'Z'");
    const toDate = format(uiDateRange.to, "yyyy-MM-dd'Z'");

    // Base URL and common parameters
    const baseParams = `f=${fromDate}&t=${toDate}&consumer=${uiConsumer}&chain_id=${uiChainId}`;

    // Choose endpoint based on key presence
    const endpoint = key
      ? `providerConsumerOptimizerMetricsFull/${providerId}`
      : `providerConsumerOptimizerMetrics/${providerId}`;

    // Combine endpoint with parameters
    return `${endpoint}?${baseParams}${key ? `&key=${key}` : ''}`;
  }, [providerId, uiConsumer, uiChainId, uiDateRange, key]);

  const chartData = useMemo(() => {
    if (!rawData?.metrics) return [];

    return rawData.metrics.map((metric: any) => {
      const baseData = {
        timestamp: new Date(metric.hourly_timestamp).getTime(),
        latency_score: parseFloat(metric.latency_score.toString()),
        availability_score: parseFloat(metric.availability_score.toString()),
        sync_score: parseFloat(metric.sync_score.toString()),
        node_error_rate: parseFloat(metric.node_error_rate.toString()),
        entry_index: parseFloat(metric.entry_index.toString()),
        generic_score: parseFloat(metric.generic_score.toString()),
      };

      // Add tier data if it exists in the response
      if ('tier_chances' in metric) {
        return {
          ...baseData,
          tier_average: parseFloat(metric.tier_average.toString()),
          tier0: parseFloat(metric.tier_chances.tier0.toString()),
          tier1: parseFloat(metric.tier_chances.tier1.toString()),
          tier2: parseFloat(metric.tier_chances.tier2.toString()),
          tier3: parseFloat(metric.tier_chances.tier3.toString()),
        };
      }

      return baseData;
    });
  }, [rawData]);

  // Filter data to match exact date range
  const filteredData = useMemo(() => {
    if (!rawData?.metrics || !uiDateRange.from || !uiDateRange.to) return rawData;

    const startDate = startOfDay(uiDateRange.from);
    const endDate = endOfDay(uiDateRange.to);

    const filteredMetrics = rawData.metrics.filter((metric: BaseMetric | FullMetric) => {
      const metricDate = parseISO(metric.hourly_timestamp);
      return isWithinInterval(metricDate, { start: startDate, end: endDate });
    });

    return { ...rawData, metrics: filteredMetrics };
  }, [rawData, uiDateRange]);

  const consumerOptions = useMemo(() => {
    if (!filteredData?.possibleConsumers) return [];
    return [
      { value: "all", label: "All Consumers" },
      ...filteredData.possibleConsumers.map((consumer: string) => ({
        value: consumer,
        label: consumer
      }))
    ];
  }, [filteredData?.possibleConsumers]);

  const chainOptions = useMemo(() => {
    if (!filteredData?.possibleChainIds) return [];
    return [
      { value: "all", label: "All Chains" },
      ...filteredData.possibleChainIds.map((chainId: string) => ({
        value: chainId,
        label: chainId
      }))
    ];
  }, [filteredData?.possibleChainIds]);

  useEffect(() => {
    if (!isLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (chartData.length > 0) {
      setHasEverHadData(true);
    }
  }, [chartData]);

  useEffect(() => {
    setIsFullMode(Boolean(rawData?.metrics?.[0]?.tier_chances));
  }, [rawData]);

  const formatAxisDate = (timestamp: number, index: number): string =>
    formatChartDate({ timestamp, index });

  if (!initialLoadComplete && isLoading) {
    return (
      <Card style={{ padding: '23px' }}>
        <LoadingIndicator loadingText={`Loading optimizer metrics data`} greyText={`metrics`} />
      </Card>
    );
  }

  const handleDateRangeSelect = (range: any) => {
    setTempDateRange(range);
  };

  const handleCalendarCancel = () => {
    setTempDateRange(uiDateRange);
    setIsCalendarOpen(false);
  };

  const handleConsumerChange = (value: string) => {
    setUiConsumer(value);
  };

  const handleChainChange = (value: string) => {
    setUiChainId(value);
  };

  const handleCalendarClose = () => {
    setUiDateRange(tempDateRange);
    setIsCalendarOpen(false);
  };

  const toggleLine = (key: MetricKey) => {
    setVisibleLines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload]
        .filter((entry) => entry.dataKey in ALL_METRICS_CONFIG && visibleLines[entry.dataKey as MetricKey])
        .sort((a, b) => b.value - a.value);

      return (
        <div className="custom-tooltip bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="label text-sm font-medium text-foreground mb-2">
            {formatChartDate({ timestamp: label, index: 1, showTime: true })}
          </p>
          {sortedPayload.map((entry) => (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ALL_METRICS_CONFIG[entry.dataKey as MetricKey].color }}
                />
                <span className="text-sm text-foreground">
                  {ALL_METRICS_CONFIG[entry.dataKey as MetricKey].label}:
                </span>
              </div>
              <span className="text-sm font-medium text-foreground ml-4">
                {entry.value.toFixed(5)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="custom-legend">
        {payload.map((entry: any) => (
          <div
            key={entry.dataKey}
            className="legend-item"
            style={{ color: ALL_METRICS_CONFIG[entry.dataKey as MetricKey].color }}
          >
            <span className="legend-color" style={{ backgroundColor: ALL_METRICS_CONFIG[entry.dataKey as MetricKey].color }} />
            <span>{ALL_METRICS_CONFIG[entry.dataKey as MetricKey].label}</span>
          </div>
        ))}
      </div>
    );
  };

  const getVisibleMetricKeys = () => {
    const baseMetrics = ['latency_score', 'availability_score', 'sync_score', 'node_error_rate', 'entry_index', 'generic_score'];
    const tierMetrics = ['tier_average', 'tier0', 'tier1', 'tier2', 'tier3'];

    return isFullMode ? [...baseMetrics, ...tierMetrics] : baseMetrics;
  };

  const renderMetricLines = () => {
    const visibleMetricKeys = getVisibleMetricKeys();
    return Object.entries(ALL_METRICS_CONFIG)
      .filter(([key]) => visibleMetricKeys.includes(key) && visibleLines[key as MetricKey])
      .map(([key, config]) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          name={config.label}
          stroke={config.color}
          dot={false}
        />
      ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <CardTitle>Provider's Consumer Optimizer Metrics
                <ModernTooltip title={[
                  "Scores range from 0 to 1, where lower scores are better for latency and sync,",
                  "while availability should be close to 1.",
                  "The Relative Placement shows this provider's rank compared to other providers,",
                  "where 1 represents the best performing provider."
                ].join('\n')}>
                  <InfoCircledIcon
                    className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer ml-2"
                  />
                </ModernTooltip>
              </CardTitle>
              <CardDescription>
                Provider score and rank as reported from the lava consumer's side
              </CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-1 [&>*:last-child]:col-span-1 min-[1000px]:grid-cols-3 min-[1200px]:flex min-[1200px]:gap-4 gap-2">
            <DropDownRadioOptions
              options={consumerOptions}
              value={uiConsumer}
              setValue={handleConsumerChange}
              placeholder="Select a consumer"
              displayValue={(value) => {
                const option = consumerOptions.find(opt => opt.value === value);
                return option ? (option.label.length > 20 ? `${option.label.slice(0, 20)}...` : option.label) : '';
              }}
              className="w-full"
            />
            <DropDownRadioOptions
              options={chainOptions}
              value={uiChainId}
              setValue={handleChainChange}
              placeholder="Select a chain"
              className="w-full"
            />
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
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
              <PopoverContent className="w-auto p-0" align="end" side="bottom">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "relative",
          (!hasEverHadData && initialLoadComplete) ? "h-[100px]" : "h-[400px]"
        )}>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%" className="-ml-6">
              <ComposedChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  padding={{ left: 0, right: 0 }}
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tickFormatter={formatAxisDate}
                  interval="preserveStartEnd"
                  minTickGap={50}
                  textAnchor="end"
                  height={60}
                  dy={0}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {renderMetricLines()}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke="hsl(var(--muted-foreground) / 0.3)"
                  tickFormatter={formatAxisDate}
                  fill="hsl(var(--background))"
                  travellerWidth={10}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {(isValidating || error || chartData.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              {isValidating && <p className="text-muted-foreground">Reloading data...</p>}
              {error && <p className="text-destructive">Error: {error.message}</p>}
              {!isValidating && !error && chartData.length === 0 && (
                <p className="text-muted-foreground">No entries found</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 text-xs">
          {Object.entries(ALL_METRICS_CONFIG)
            .filter(([key]) => getVisibleMetricKeys().includes(key))
            .map(([key, config]) => (
              <div
                key={key}
                className={`group relative flex items-start gap-2 p-2 rounded-md border border-border/50 
                  ${visibleLines[key as MetricKey] ? 'bg-card/50' : 'bg-muted/50'} 
                  hover:bg-card transition-all duration-200 cursor-pointer`}
                onClick={() => toggleLine(key as MetricKey)}
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background 
                    transition-all duration-200 group-hover:ring-offset-4
                    ${!visibleLines[key as MetricKey] && 'opacity-50'}`}
                  style={{
                    backgroundColor: config.color,
                    boxShadow: `0 0 0.5rem ${config.color}25`,
                    '--tw-ring-color': config.color
                  } as React.CSSProperties}
                />
                <div className="space-y-0.5 relative">
                  <div
                    className="absolute -inset-2 rounded-md opacity-0 group-hover:opacity-100 bg-gradient-to-r transition-opacity duration-200"
                    style={{
                      background: `linear-gradient(45deg, ${config.color}03, ${config.color}09)`,
                      zIndex: -1
                    }}
                  />
                  <p className={`font-medium transition-colors duration-200
                    ${visibleLines[key as MetricKey] ? 'text-foreground/90 group-hover:text-foreground' : 'text-muted-foreground/60'}`}>
                    {config.label}
                  </p>
                  <p className={`text-[10px] transition-colors duration-200
                    ${visibleLines[key as MetricKey] ? 'text-muted-foreground/80 group-hover:text-muted-foreground' : 'text-muted-foreground/50'}`}>
                    {config.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProviderOptimizerMetricsChart;
