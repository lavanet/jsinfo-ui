"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, addDays } from "date-fns";
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

interface ProviderConsumerOptimizerMetricsChartProps {
  providerId: string;
}

interface ChartDataPoint {
  timestamp: number;
  sync_score: number;
  latency_score: number;
  availability_score: number;
  generic_score: number;
  node_error_rate: number;
  entry_index: number;
}

interface MetricDefinition {
  label: string;
  dataKey: keyof Omit<ChartDataPoint, 'timestamp'>;
  color: string;
  description: string;
}

const METRICS: MetricDefinition[] = [
  {
    label: 'Sync Score',
    dataKey: 'sync_score',
    color: '#4f46e5', // Indigo
    description: 'Lower is better. Measures block height difference from network average'
  },
  {
    label: 'Latency Score',
    dataKey: 'latency_score',
    color: '#059669', // Emerald
    description: 'Lower is better. Average response time compared to other providers'
  },
  {
    label: 'Availability Score',
    dataKey: 'availability_score',
    color: '#eab308', // Yellow
    description: 'Higher is better. Percentage of successful responses over time'
  },
  {
    label: 'Generic Score',
    dataKey: 'generic_score',
    color: '#7c3aed', // Violet
    description: 'Lower is better. Combined performance metric across all categories'
  },
  {
    label: 'Node Error Rate',
    dataKey: 'node_error_rate',
    color: '#dc2626', // Red
    description: 'Lower is better. Percentage of requests resulting in errors'
  },
  {
    label: 'Relative Placement',
    dataKey: 'entry_index',
    color: '#0891b2', // Cyan
    description: '1 is best. Your ranking position among all active providers'
  }
];

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

const ProviderConsumerOptimizerMetricsChart: React.FC<ProviderConsumerOptimizerMetricsChartProps> = ({ providerId }) => {
  const [uiConsumer, setUiConsumer] = useState("all");
  const [uiChainId, setUiChainId] = useState("all");
  const [uiDateRange, setUiDateRange] = useState({
    from: addDays(new Date(), -90),
    to: new Date(),
  });

  const apiFilters = useMemo(() => ({
    consumer: uiConsumer,
    chainId: uiChainId,
    dateRange: uiDateRange
  }), [uiConsumer, uiChainId, uiDateRange]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(uiDateRange);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasEverHadData, setHasEverHadData] = useState(false);

  const { data, error, isLoading, isValidating } = useJsinfobeFetchWithDeps<any>(() => {
    const fromDate = format(apiFilters.dateRange.from, "yyyy-MM-dd'Z'");
    const toDate = format(apiFilters.dateRange.to, "yyyy-MM-dd'Z'");
    return `providerConsumerOptimizerMetrics/${providerId}?f=${fromDate}&t=${toDate}&consumer=${apiFilters.consumer}&chain_id=${apiFilters.chainId}`;
  }, [providerId, apiFilters]);

  const consumerOptions = useMemo(() => {
    if (!data?.possibleConsumers) return [];
    return [
      { value: "all", label: "All Consumers" },
      ...data.possibleConsumers.map((consumer: string) => ({
        value: consumer,
        label: consumer
      }))
    ];
  }, [data?.possibleConsumers]);

  const chainOptions = useMemo(() => {
    if (!data?.possibleChainIds) return [];
    return [
      { value: "all", label: "All Chains" },
      ...data.possibleChainIds.map((chainId: string) => ({
        value: chainId,
        label: chainId
      }))
    ];
  }, [data?.possibleChainIds]);

  const chartData = useMemo(() => {
    if (!data?.metrics) return [];
    return data.metrics.map((metric: any): ChartDataPoint => ({
      timestamp: new Date(metric.hourly_timestamp).getTime(),
      sync_score: parseFloat(metric.sync_score),
      latency_score: parseFloat(metric.latency_score),
      availability_score: parseFloat(metric.availability_score),
      generic_score: parseFloat(metric.generic_score),
      entry_index: parseFloat(metric.entry_index),
      node_error_rate: parseFloat(metric.node_error_rate),
    }));
  }, [data?.metrics]);

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload as ChartDataPoint;

    return (
      <Card className="p-2">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">
            {formatChartDate({ timestamp: data.timestamp, index: 1, showTime: true })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-1">
          {METRICS.map(({ label, dataKey, color }) => (
            <div
              key={dataKey}
              className="flex items-center gap-2"
            >
              <div
                className="h-2 w-2 rounded-full ring-1 ring-offset-1 ring-offset-background"
                style={{
                  backgroundColor: color,
                  '--tw-ring-color': color
                } as React.CSSProperties}
              />
              <p className="text-sm flex justify-between items-center w-full gap-8">
                <span className="text-muted-foreground whitespace-nowrap">{label}:</span>
                <span className="font-medium tabular-nums" style={{ color }}>
                  {Number(data[dataKey]).toFixed(4)}
                </span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <CardTitle>Provider's Consumer Optimizer Metrics
                <ModernTooltip title={
                  "Scores range from 0 to 1, where lower scores are better for latency and sync,\n" +
                  "while availability should be close to 1.\n" +
                  "The Relative Placement shows this provider's rank compared to other providers,\n" +
                  "where 1 represents the best performing provider."
                }>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer ml-2" />
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
                {METRICS.map(({ dataKey, color, label }) => (
                  <Line
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    dot={false}
                    name={label}
                  />
                ))}
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
          {METRICS.map(({ label, color, description }) => (
            <div
              key={label}
              className="group relative flex items-start gap-2 p-2 rounded-md border border-border/50 bg-card/50 hover:bg-card transition-all duration-200"
            >
              <div
                className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-offset-4"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 0.5rem ${color}25`,
                  '--tw-ring-color': color
                } as React.CSSProperties}
              />
              <div className="space-y-0.5 relative">
                <div className="absolute -inset-2 rounded-md opacity-0 group-hover:opacity-100 bg-gradient-to-r transition-opacity duration-200"
                  style={{
                    background: `linear-gradient(45deg, ${color}03, ${color}09)`,
                    zIndex: -1
                  }}
                />
                <p className="font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-200">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderConsumerOptimizerMetricsChart;
