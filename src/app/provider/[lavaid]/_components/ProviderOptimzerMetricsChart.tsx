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
  const [selectedConsumer, setSelectedConsumer] = useState("all");
  const [selectedChainId, setSelectedChainId] = useState("all");

  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -90),
    to: new Date(),
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const { data, error, isLoading } = useJsinfobeFetchWithDeps<any>(() => {
    const fromDate = format(dateRange.from, "yyyy-MM-dd'Z'");
    const toDate = format(dateRange.to, "yyyy-MM-dd'Z'");
    return `providerConsumerOptimizerMetrics/${providerId}?f=${fromDate}&t=${toDate}&consumer=${selectedConsumer}&chain_id=${selectedChainId}`;
  }, [providerId, dateRange, selectedConsumer, selectedChainId]);

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
        (selectedConsumer === "all" || metric.consumer === selectedConsumer) &&
        (selectedChainId === "all" || metric.chain_id === selectedChainId)
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
  }, [data?.metrics, selectedConsumer, selectedChainId]);

  const handleDateRangeSelect = (range: any) => {
    setTempDateRange(range);
  };

  const handleCalendarClose = () => {
    setDateRange(tempDateRange);
    setIsCalendarOpen(false);
  };

  const handleCalendarCancel = () => {
    setTempDateRange(dateRange);
    setIsCalendarOpen(false);
  };

  if (isLoading || error || !data) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-background border p-2 rounded-md">
        <p>Time: {format(data.timestamp, "yyyy-MM-dd HH:mm")}</p>
        <p>Sync Score: {data.sync_score.toFixed(2)}</p>
        <p>Latency Score: {data.latency_score.toFixed(2)}</p>
        <p>Availability Score: {data.availability_score.toFixed(2)}</p>
        <p>Generic Score: {data.generic_score.toFixed(2)}</p>
        <p>Node Error Rate: {data.node_error_rate.toFixed(2)}</p>
        <p>Entry Index: {data.entry_index.toFixed(2)}</p>
      </div>
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
              value={selectedConsumer}
              setValue={setSelectedConsumer}
              placeholder="Select a consumer"
              className="w-[500px]"
            />
            <DropDownRadioOptions
              options={chainOptions}
              value={selectedChainId}
              setValue={setSelectedChainId}
              placeholder="Select a chain"
            />
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
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
        <div className="h-[400px]">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderConsumerOptimizerMetricsChart;
