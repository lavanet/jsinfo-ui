"use client";

import React, { useState, useMemo } from "react";
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

  const [apiFilters, setApiFilters] = useState({
    consumer: uiConsumer,
    chainId: uiChainId,
    dateRange: uiDateRange
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(uiDateRange);

  const { data, error, isLoading } = useJsinfobeFetchWithDeps<any>(() => {
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
    return data.metrics
      .filter((metric: any) =>
        (uiConsumer === "all" || metric.consumer === uiConsumer) &&
        (uiChainId === "all" || metric.chain_id === uiChainId)
      )
      .map((metric: any) => ({
        timestamp: new Date(metric.timestamp).getTime(),
        sync_score: parseFloat(metric.sync_score),
        latency_score: parseFloat(metric.latency_score),
        availability_score: parseFloat(metric.availability_score),
        generic_score: parseFloat(metric.generic_score),
        node_error_rate: parseFloat(metric.node_error_rate),
        entry_index: parseFloat(metric.entry_index),
      }));
  }, [data?.metrics, uiConsumer, uiChainId]);

  const handleDateRangeSelect = (range: any) => {
    setTempDateRange(range);
  };

  const handleCalendarClose = () => {
    setApiFilters({
      consumer: uiConsumer,
      chainId: uiChainId,
      dateRange: tempDateRange
    });
    setIsCalendarOpen(false);
  };

  const handleCalendarCancel = () => {
    setTempDateRange(uiDateRange);
    setIsCalendarOpen(false);
  };

  const handleApplyFilters = () => {
    setApiFilters({
      consumer: uiConsumer,
      chainId: uiChainId,
      dateRange: uiDateRange
    });
  };

  if (isLoading || error || !data) return null;

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Provider's Consumer Optimizer Metrics</CardTitle>
            <CardDescription>
              Provider score and rank as reported from the lava consumer's side
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <DropDownRadioOptions
              options={consumerOptions}
              value={uiConsumer}
              setValue={setUiConsumer}
              placeholder="Select a consumer"
              className="w-[500px]"
            />
            <DropDownRadioOptions
              options={chainOptions}
              value={uiChainId}
              setValue={setUiChainId}
              placeholder="Select a chain"
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <p>Reloading data...</p>
            </div>
          )}
          {error ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-destructive">Error: {error.message}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No entries found</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tickFormatter={(timestamp) => format(timestamp, "MM/dd")}
                  tick={{ key: "x-axis-tick" }}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderConsumerOptimizerMetricsChart;
