// src/components/sections/UsageGraph.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import useSWR from 'swr';
import { format, addDays } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { DateRange } from "react-day-picker";
import {
  Area, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Brush,
  Legend, ResponsiveContainer, AreaChart
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jsinfo/components/radixui/Card";
import { Button } from "@jsinfo/components/radixui/Button";
import { Calendar } from "@jsinfo/components/shadcn/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@jsinfo/components/radixui/Popover";
import CustomCombobox from "../../components/sections/CustomCombobox";
import { cn } from "@jsinfo/lib/css"
import UsageGraphSkeleton from "../../components/sections/UsageGraphSkeleton";
import useApiSwrFetch from "@jsinfo/hooks/useApiSwrFetch";
import { CalendarWithLastXButtons } from "@jsinfo/components/shadcn/CalendarWithLastXButtons";

const fetcher = (url: string | URL | Request) => fetch(url).then((res) => res.json());

interface UsageGraphProps {
  providerId?: string | null;
}

type VisibleLinesType = {
  [key: string]: boolean;
  qos: boolean;
  qosSyncAvg: boolean;
  qosAvailabilityAvg: boolean;
  qosLatencyAvg: boolean;
};

export function UsageGraph(props: UsageGraphProps = { providerId: null }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -90),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [visibleLines, setVisibleLines] = useState<VisibleLinesType>({
    qos: true,
    qosSyncAvg: true,
    qosAvailabilityAvg: true,
    qosLatencyAvg: true,
  });


  const { data, error, isLoading } = useApiSwrFetch(() => {
    if (dateRange?.from && dateRange?.to) {
      const fromDate = format(dateRange.from, "yyyy-MM-dd'Z'");
      const toDate = format(dateRange.to, "yyyy-MM-dd'Z'");
      return `indexChartsV2?f=${fromDate}&t=${toDate}`;
    }
    return null;
  });

  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);

  const qosColors: { [key: string]: { start: string; end: string } } = {
    qos: { start: "#00ff00", end: "#ff0000" },
    qosSyncAvg: { start: "#00ffff", end: "#0000ff" },
    qosAvailabilityAvg: { start: "#00ff00", end: "#ff0000" },
    qosLatencyAvg: { start: "#ff00ff", end: "#800080" },
  };

  const { chartData, chartConfig } = useMemo(() => {
    if (!data || !data.data) {
      return { chartData: [], chartConfig: {} };
    }

    const sortedData = [...data.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const allChains = new Set<string>()
    sortedData.forEach((day) => {
      if (Array.isArray(day.data)) {
        day.data.forEach((chain: { specId: string | undefined; chainId: string | undefined; }) => {
          if (chain.specId && chain.specId !== "All Chains") {
            allChains.add(chain.specId)
          } else if (chain.chainId && chain.chainId !== "All Specs") {
            allChains.add(chain.chainId)
          }
        })
      }
    })

    setAvailableChains(Array.from(allChains));

    const chartData = sortedData.map((day) => {
      const dayData: { [key: string]: any } = {
        date: day.date,
        qos: day.qos,
        qosSyncAvg: day.qosSyncAvg,
        qosAvailabilityAvg: day.qosAvailabilityAvg,
        qosLatencyAvg: day.qosLatencyAvg,
        totalRelays: 0,
      }
      if (Array.isArray(day.data)) {
        day.data.forEach((chain: { specId: string | undefined; chainId: string | undefined; relaySum: number | undefined; relays: number | undefined; }) => {
          if (chain.specId && chain.specId !== "All Specs") {
            dayData[chain.specId] = chain.relays || 0
            dayData.totalRelays += chain.relays || 0
          } else if (chain.chainId && chain.chainId !== "All Specs") {
            dayData[chain.chainId] = chain.relaySum || 0
            dayData.totalRelays += chain.relaySum || 0
          }
        })
      }
      return dayData
    })

    const chartConfig: { [key: string]: { label: string; color: string } } = props.providerId
      ? {
        qosSyncAvg: { label: "QoS Sync Score", color: qosColors.qosSyncAvg.start },
        qosAvailabilityAvg: { label: "QoS Availability Score", color: qosColors.qosAvailabilityAvg.start },
        qosLatencyAvg: { label: "QoS Latency Score", color: qosColors.qosLatencyAvg.start },
      }
      : {
        qos: { label: "QoS Score", color: qosColors.qos.start },
      };

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    Array.from(allChains).forEach((chain, index) => {
      chartConfig[chain] = {
        label: chain,
        color: colors[index % colors.length],
      }
    });

    return { chartData, chartConfig }
  }, [data, selectedChains, props.providerId]);


  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev: VisibleLinesType) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    if (availableChains.length > 0 && selectedChains.length === 0) {
      setSelectedChains(availableChains.slice(0, 5));
    }
  }, [availableChains, selectedChains]);

  useEffect(() => {
    Object.entries(chartConfig).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}-color`, value.color);
    });
  }, [chartConfig]);

  const handleSelectionChange = (newSelection: React.SetStateAction<string[]>) => {
    setSelectedChains(newSelection);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
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

  const disabledDays = { after: new Date() };

  const getQoSColor = (score: number) => {
    if (score >= 0.99) return '#00ff00';
    if (score >= 0.97) return '#ffff00';
    return '#ff0000';
  };

  const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: any[], label: string }) => {
    if (active && payload && payload.length) {
      const qosScore = payload.find(p => p.dataKey === 'qos')?.value;

      return (
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">{new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {props.providerId ? (
              <>
                <p className="text-sm">QoS Sync Score: {payload.find(p => p.dataKey === 'qosSyncAvg')?.value?.toFixed(4)}</p>
                <p className="text-sm">QoS Availability Score: {payload.find(p => p.dataKey === 'qosAvailabilityAvg')?.value?.toFixed(4)}</p>
                <p className="text-sm">QoS Latency Score: {payload.find(p => p.dataKey === 'qosLatencyAvg')?.value?.toFixed(4)}</p>
              </>
            ) : (
              <p className="font-semibold text-sm">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getQoSColor(qosScore) }}></span>
                QoS Score: {qosScore?.toFixed(4)}
              </p>

            )}
            {selectedChains.map((chain) => (
              <p key={chain} className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: chartConfig[chain]?.color }}></span>
                {chain}: <span className="font-mono">{payload.find(p => p.dataKey === chain)?.value?.toLocaleString().padStart(10)}</span>
              </p>
            ))}
            <p className="font-semibold text-sm mt-2">
              Total Relays: <span className="font-mono">{payload.find(p => p.dataKey === selectedChains[0])?.payload?.totalRelays?.toLocaleString().padStart(10)}</span>
            </p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {payload.map((entry: { color: any; value: any; dataKey: string }, index: any) => {
          const isQoSMetric = entry.dataKey.startsWith('qos');
          return (
            <div
              key={`item-${index}`}
              className={`flex items-center ${isQoSMetric ? 'cursor-pointer' : ''}`}
              onClick={() => isQoSMetric && toggleLineVisibility(entry.dataKey)}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: qosColors[entry.dataKey]?.start || entry.color,
                  opacity: isQoSMetric && !visibleLines[entry.dataKey] ? 0.3 : 1
                }}
              ></span>
              <span style={{ opacity: isQoSMetric && !visibleLines[entry.dataKey] ? 0.3 : 1 }}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (error) return <div>Failed to load data</div>;
  if (!data) return <UsageGraphSkeleton />;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 pb-4 sm:pb-2">
        <div className="space-y-1">
          <CardTitle>{props.providerId ? 'Provider QoS Scores and Relays' : 'QoS Score and Selected Chains'}</CardTitle>
          <CardDescription>
            {props.providerId ? 'Showing QoS scores and relay counts for the selected provider' : 'Showing QoS score and relay counts for selected chains'}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
          <CustomCombobox
            availableChains={availableChains || []}
            selectedChains={selectedChains || []}
            onSelectionChange={handleSelectionChange}
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
                <Button
                  variant="outline"
                  onClick={handleCalendarCancel}
                >
                  Cancel
                </Button>
                <Button onClick={handleCalendarClose}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {error ? (
            <div>Error loading data</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  {Object.entries(qosColors).map(([key, { start, end }]) => (
                    <linearGradient key={key} id={`${key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={start} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={end} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                  {Object.entries(chartConfig).map(([key, value]) => (
                    <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--${key}-color)`} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={`var(--${key}-color)`} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  className="text-muted-foreground text-xs"
                />
                <YAxis yAxisId="left" orientation="left" tick={true} className="text-muted-foreground text-xs" />
                <YAxis yAxisId="right" orientation="right" tick={true} domain={[0, 1]} className="text-muted-foreground text-xs" />
                <Tooltip content={<CustomTooltip active={false} payload={[]} label={""} />} />
                <Legend content={renderLegend} />
                {props.providerId ? (
                  <>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="qosSyncAvg"
                      name="QoS Sync Score"
                      stroke="url(#qosSyncAvgGradient)"
                      strokeWidth={2}
                      dot={false}
                      hide={!visibleLines.qosSyncAvg}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="qosAvailabilityAvg"
                      name="QoS Availability Score"
                      stroke="url(#qosAvailabilityAvgGradient)"
                      strokeWidth={2}
                      dot={false}
                      hide={!visibleLines.qosAvailabilityAvg}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="qosLatencyAvg"
                      name="QoS Latency Score"
                      stroke="url(#qosLatencyAvgGradient)"
                      strokeWidth={2}
                      dot={false}
                      hide={!visibleLines.qosLatencyAvg}
                    />
                  </>
                ) : (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="qos"
                    name="QoS Score"
                    stroke="url(#qosGradient)"
                    strokeWidth={2}
                    dot={false}
                    hide={!visibleLines.qos}
                  />
                )}

                {selectedChains.map((chain) => (
                  <Area
                    key={chain}
                    yAxisId="left"
                    type="monotone"
                    dataKey={chain}
                    stroke={`var(--${chain}-color)`}
                    fill={`url(#fill${chain})`}
                    stackId="1"
                  />
                ))}
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="hsl(var(--muted-foreground) / 0.3)"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }}
                  fill="hsl(var(--background))"
                  travellerWidth={10}
                >
                  <AreaChart>
                    <Area
                      type="monotone"
                      dataKey="totalRelays"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted))"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </Brush>
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div>No data available for the selected date range</div>
          )}
        </div>
        {isLoading && (
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Updating data...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

