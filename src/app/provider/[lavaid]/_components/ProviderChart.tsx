// src/app/provider/[lavaid]/_components/ProviderChart.tsx

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
import { cn } from "@jsinfo/lib/css"
import UsageGraphSkeleton from "@jsinfo/components/sections/UsageGraphSkeleton";
import { useJsinfobeFetchWithDeps } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { CalendarWithLastXButtons } from "@jsinfo/components/shadcn/CalendarWithLastXButtons";
import { CHART_COLORS } from "@jsinfo/lib/consts";
import { removeSpacesForCss } from "@jsinfo/lib/utils";
import DropDownRadioOptions from "@jsinfo/components/shadcn/DropDownRadioOptions";

interface ProviderChartProps {
  providerId: string;
}

type VisibleLinesType = {
  [key: string]: boolean;
  qos: boolean;
  qosSyncAvg: boolean;
  qosAvailabilityAvg: boolean;
  qosLatencyAvg: boolean;
};

interface ChartDataItem {
  date: string;
  qos: number;
  qosSyncAvg: number;
  qosAvailabilityAvg: number;
  qosLatencyAvg: number;
  cus: number;
  relays: number;
}

interface ProviderChartV2Data {
  provider: string;
  selectedChain: string;
  allAvailableSpecs: string[];
  chartData: ChartDataItem[];
}

const ProviderChart: React.FC<ProviderChartProps> = ({ providerId }) => {
  const [selectedChain, setSelectedChain] = useState("all");
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
    relays: true,
    cus: true,
  });

  const { data, error, isLoading, isValidating } = useJsinfobeFetchWithDeps<ProviderChartV2Data>(() => {
    if (dateRange?.from && dateRange?.to && selectedChain) {
      const fromDate = format(dateRange.from, "yyyy-MM-dd'Z'");
      const toDate = format(dateRange.to, "yyyy-MM-dd'Z'");
      return `providerChartsV2/${selectedChain}/${providerId}?f=${fromDate}&t=${toDate}`;
    }
    return null;
  }, [dateRange?.from, dateRange?.to, selectedChain, providerId]);

  const qosColors: { [key: string]: { start: string; end: string } } = {
    qos: { start: "#00ff00", end: "#ff0000" },
    qosSyncAvg: { start: "#00ffff", end: "#0000ff" },
    qosAvailabilityAvg: { start: "#00ff00", end: "#ff0000" },
    qosLatencyAvg: { start: "#ff00ff", end: "#800080" },
  };

  const options = useMemo(() => {
    if (!data) return [];
    return data.allAvailableSpecs.map(spec => ({
      value: spec,
      label: spec === 'all' ? 'All Chains' : spec
    }));
  }, [data]);

  const { chartData, chartConfig } = useMemo(() => {
    if (!data) {
      return { chartData: [], chartConfig: {} };
    }

    const chartConfig: { [key: string]: { label: string; color: string } } = {
      qosSyncAvg: { label: "QoS Sync Score", color: qosColors.qosSyncAvg.start },
      qosAvailabilityAvg: { label: "QoS Availability Score", color: qosColors.qosAvailabilityAvg.start },
      qosLatencyAvg: { label: "QoS Latency Score", color: qosColors.qosLatencyAvg.start },
      relays: { label: "Relays", color: CHART_COLORS[0] },
      cus: { label: "CUs", color: CHART_COLORS[1] },
    };

    return { chartData: data.chartData, chartConfig };
  }, [data]);

  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev: VisibleLinesType) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    Object.entries(chartConfig).forEach(([key, value]) => {
      let key2 = removeSpacesForCss(key);
      document.documentElement.style.setProperty(`--${key2}-color`, value.color);
    });
  }, [chartConfig]);

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

  const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: any[], label: string }) => {
    if (active && payload && payload.length) {

      return (
        <Card className="p-2">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">{new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">

            <p className="text-sm">QoS Sync Score: {payload.find(p => p.dataKey === 'qosSyncAvg')?.value?.toFixed(4)}</p>
            <p className="text-sm">QoS Availability Score: {payload.find(p => p.dataKey === 'qosAvailabilityAvg')?.value?.toFixed(4)}</p>
            <p className="text-sm">QoS Latency Score: {payload.find(p => p.dataKey === 'qosLatencyAvg')?.value?.toFixed(4)}</p>

            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: chartConfig.relays?.color }}></span>
              Relays: <span className="font-mono">{payload.find(p => p.dataKey === 'relays')?.value?.toLocaleString().padStart(10)}</span>
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: chartConfig.cus?.color }}></span>
              CUs: <span className="font-mono">{payload.find(p => p.dataKey === 'cus')?.value?.toLocaleString().padStart(10)}</span>
            </p>
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
          const displayName = entry.dataKey === 'cus' ? 'CUs' :
            entry.dataKey === 'relays' ? 'Relays' :
              entry.value;
          return (
            <div
              key={`item-${index}`}
              className="flex items-center cursor-pointer"
              onClick={() => toggleLineVisibility(entry.dataKey)}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: isQoSMetric ? qosColors[entry.dataKey]?.start : entry.color,
                  opacity: visibleLines[entry.dataKey] ? 1 : 0.3
                }}
              ></span>
              <span style={{ opacity: visibleLines[entry.dataKey] ? 1 : 0.3 }}>
                {displayName}
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
      <CardHeader className="rechars-container">
        <div className="rechars-container-title">
          <CardTitle>Provider QoS Scores and Relays</CardTitle>
          <CardDescription>
            Showing QoS scores and relay counts for the selected provider
          </CardDescription>
        </div>
        <div className="rechars-container-controls">
          {/* <CustomCombobox
            availableChains={availableChains || []}
            selectedChains={selectedChains || []}
            onSelectionChange={handleSelectionChange}
          /> */}
          <DropDownRadioOptions
            options={options}
            value={selectedChain}
            setValue={setSelectedChain}
            placeholder="All Chains"
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
        {error ? (
          <div className="h-[350px] w-full">
            <div>Error loading data</div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[350px] w-full">
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

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="relays"
                  name="Relays"
                  stroke={`var(--${removeSpacesForCss('relays')}-color)`}
                  fill={`url(#fill${removeSpacesForCss('relays')})`}
                  stackId="1"
                  hide={!visibleLines.relays}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="cus"
                  name="CUs"
                  stroke={`var(--${removeSpacesForCss('cus')}-color)`}
                  fill={`url(#fill${removeSpacesForCss('cus')})`}
                  stackId="1"
                  hide={!visibleLines.cus}
                />

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
          </div>
        ) : (
          <div className="h-[150px] w-full">
            <br />
            <div>No chart data is available for this provider or in the selected date range</div>
          </div>
        )}
        {(isLoading || isValidating) && (
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Updating data...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProviderChart;
