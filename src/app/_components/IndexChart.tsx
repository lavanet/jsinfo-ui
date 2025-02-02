// src/components/sections/IndexChart.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "@jsinfo/components/shadcn/ui/Card";
import { Button } from "@jsinfo/components/shadcn/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@jsinfo/components/shadcn/ui/Popover";
import CustomCombobox from "./IndexChartCustomCombobox";
import { cn } from "@jsinfo/lib/css"
import IndexChartSkeleton from "./IndexChartSkeleton";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { CalendarWithLastXButtons } from "@jsinfo/components/shadcn/CalendarWithLastXButtons";
import { Checkbox } from "@jsinfo/components/shadcn/ui/Checkbox";

import { CHART_COLORS } from "@jsinfo/lib/consts";
import { removeSpacesForCss } from "@jsinfo/lib/utils";

interface IndexChartProps {
  providerId?: string | null;
}

type VisibleLinesType = {
  [key: string]: boolean;
  qos: boolean;
  qosSyncAvg: boolean;
  qosAvailabilityAvg: boolean;
  qosLatencyAvg: boolean;
};

export function IndexChart(props: IndexChartProps = { providerId: null }) {
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
  const [showAllChains, setShowAllChains] = useState(true);

  const { data, error, isLoading, isValidating } = useJsinfobeFetch(() => {
    if (dateRange?.from && dateRange?.to) {
      const fromDate = format(dateRange.from, "yyyy-MM-dd'Z'");
      const toDate = format(dateRange.to, "yyyy-MM-dd'Z'");
      let ret = `indexChartsV3?f=${fromDate}&t=${toDate}`;
      return ret;
    }
    return null;
  });

  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>(["All Chains"]);

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
          if (chain.chainId) {
            allChains.add(chain.chainId)
          }
        })
      }
    })

    setAvailableChains(Array.from(allChains).filter(chain => chain !== "All Chains"));

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
          if (chain.chainId) {
            dayData[chain.chainId] = chain.relaySum || 0
            dayData.totalRelays += chain.relaySum || 0
          }
        })
      }
      return dayData
    })

    const chartConfig: { [key: string]: { label: string; color: string } } = {
      qos: { label: "QoS Score", color: qosColors.qos.start },
    };

    Array.from(allChains).forEach((chain, index) => {
      chartConfig[chain] = {
        label: chain,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    });

    return { chartData, chartConfig }
  }, [data, selectedChains, props.providerId]);


  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev: VisibleLinesType) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    Object.entries(chartConfig).forEach(([key, value]) => {
      let key2 = removeSpacesForCss(key);
      document.documentElement.style.setProperty(`--${key2}-color`, value.color);
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
                <span className="font-bold">QoS Score:</span> {qosScore?.toFixed(4)}
              </p>

            )}
            {selectedChains.map((chain) => (
              <p key={chain} className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full mr-2 font-bold" style={{ backgroundColor: chartConfig[chain]?.color }}></span>
                <span className="font-bold">{chain}</span>: <span className="font-mono">{payload.find(p => p.dataKey === chain)?.value?.toLocaleString().padStart(10)}</span> Relays
              </p>
            ))}
            {/* <p className="font-semibold text-sm mt-2">
              Total Relays: <span className="font-mono">{payload.find(p => p.dataKey === selectedChains[0])?.payload?.totalRelays?.toLocaleString().padStart(10)}</span>
            </p> */}
          </CardContent>
        </Card >
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
                  opacity: isQoSMetric && !visibleLines[entry.dataKey as keyof VisibleLinesType] ? 0.3 : 1
                }}
              ></span>
              <span style={{ opacity: isQoSMetric && !visibleLines[entry.dataKey as keyof VisibleLinesType] ? 0.3 : 1 }}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleAllChainsChange = (checked: boolean) => {
    console.log('handleAllChainsChange called with:', checked);
    setShowAllChains(checked);
    setSelectedChains(prevSelected => {
      let newSelected;
      if (checked) {
        newSelected = prevSelected.includes("All Chains") ? prevSelected : [...prevSelected, "All Chains"];
      } else {
        newSelected = prevSelected.filter(chain => chain !== "All Chains");
      }
      return newSelected;
    });
  };

  if (error) return <div>Failed to load data</div>;
  if (!data) return <IndexChartSkeleton />;

  return (
    <Card>
      <CardHeader className="rechars-container">
        <div className="rechars-container-title">
          <CardTitle>QoS Score and Selected Chains</CardTitle>
          <CardDescription>
            Showing QoS score and relay counts for selected chains
          </CardDescription>
        </div>
        <div className="rechars-container-controls flex items-center space-x-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allChains"
                checked={showAllChains}
                onCheckedChange={handleAllChainsChange}
              />
              <label htmlFor="allChains" className="text-sm font-medium whitespace-nowrap">
                All Chains
              </label>
            </div>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {error ? (
            <div>Error loading data</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  {Object.entries(qosColors).map(([key, { start, end }]) => (
                    <linearGradient key={key} id={`${key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={start} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={end} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                  {Object.entries(chartConfig).map(([key, value]) => {
                    const key2 = removeSpacesForCss(key);
                    return (
                      <linearGradient key={key2} id={`fill${key2}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={`var(--${key2}-color)`} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={`var(--${key2}-color)`} stopOpacity={0.1} />
                      </linearGradient>
                    );
                  })}
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

                {selectedChains.map((chain) => {
                  const chain2 = removeSpacesForCss(chain);
                  return (
                    <Area
                      key={chain2}
                      yAxisId="left"
                      type="monotone"
                      dataKey={chain}
                      stroke={`var(--${chain2}-color)`}
                      fill={`url(#fill${chain2})`}
                      stackId="1"
                    />
                  );
                })}

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
        {(isLoading || isValidating) && (
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Updating data...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

