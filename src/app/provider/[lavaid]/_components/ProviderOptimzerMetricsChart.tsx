"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
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

interface ProviderConsumerOptimizerMetricsChartProps {
  providerId: string;
}

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
    return data.metrics.map((metric: any) => ({
      timestamp: new Date(metric.timestamp).getTime(),
      sync_score: parseFloat(metric.sync_score),
      latency_score: parseFloat(metric.latency_score),
      availability_score: parseFloat(metric.availability_score),
      generic_score: parseFloat(metric.generic_score),
      node_error_rate: parseFloat(metric.node_error_rate),
      entry_index: parseFloat(metric.entry_index),
    }));
  }, [data?.metrics]);

  useEffect(() => {
    if (!isLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading]);

  if (!initialLoadComplete && isLoading) return null;

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

    const data = payload[0].payload;
    return (
      <Card className="p-2">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">{format(data.timestamp, "MMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm">Sync Score: {Number(data.sync_score).toFixed(4)}</p>
          <p className="text-sm">Latency Score: {Number(data.latency_score).toFixed(4)}</p>
          <p className="text-sm">Availability Score: {Number(data.availability_score).toFixed(4)}</p>
          <p className="text-sm">Generic Score: {Number(data.generic_score).toFixed(4)}</p>
          <p className="text-sm">Node Error Rate: {Number(data.node_error_rate).toFixed(4)}</p>
          <p className="text-sm">Entry Index: {Number(data.entry_index).toFixed(4)}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
          <div>
            <CardTitle>Provider's Consumer Optimizer Metrics</CardTitle>
            <CardDescription>
              Provider score and rank as reported from the lava consumer's side
            </CardDescription>
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
        <div className="h-[400px] relative">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tickFormatter={(timestamp) => format(timestamp, "MM/dd")}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sync_score"
                  stroke="#8884d8"
                  dot={false}
                  name="Sync Score"
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
      </CardContent>
    </Card>
  );
};

export default ProviderConsumerOptimizerMetricsChart;
