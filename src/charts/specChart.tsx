// src/charts/specChart.tsx

import { CachedFetchDateRange } from "@jsinfo/common/types";
import { ConvertDateToServerQueryDate, ConvertJsInfoServerFormatedDateToJsDateObject, RenderInFullPageCard, WrapSetDatesWithFormatingAnd6MonthFromLimit } from "@jsinfo/common/utils";
import {
    CHARTJS_COLORS,
    ChartjsSetLastDotHighInChartData,
    ChartjsSetLastPointToLineInChartOptions,
    ChartJsLineChartOptions,
    ChartJsLineChartData,
    ChartJsLineChartDataset,
    ChartJsSpecIdToDatasetMap,
    ChartJsReactiveLineChartWithDatePicker
} from "@jsinfo/components/ChartJsReactiveLineChart";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TextToggle from "@jsinfo/components/TextToggle";

import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import { useState } from "react";

type SpecChartCuRelay = {
    provider: string;
    cus: number;
    relays: number;
};

type SpecChartResponse = {
    data: SpecChartCuRelay[];
} & SpecQosData;

interface QosQueryData {
    date: string;
    qosSyncAvg: number;
    qosAvailabilityAvg: number;
    qosLatencyAvg: number;
}

type SpecQosData = {
    qos: number;
} & QosQueryData;

interface SpecChartProps {
    specid: string;
}


export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'

export default function SpecChart({ specid }: SpecChartProps) {

    const [isRelayOrCuSelected, setIsRelayOrCuSelected] = useState(false);

    const today = new Date();

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const initialRange = { from: ninetyDaysAgo, to: today };

    const [dates, setDates] = useState<CachedFetchDateRange>(initialRange);

    const { data, loading, error } = useCachedFetch({
        dataKey: "specCharts/" + specid,
        useLastUrlPathInKey: false,
        apiurlDateRangeQuery: { from: ConvertDateToServerQueryDate(dates.from), to: ConvertDateToServerQueryDate(dates.to) }
    });

    // Then in your render method or function component
    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${specid} chart data`} greyText={`${specid} chart`} />);

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: SpecChartResponse[] = data.data;

    // First, sort the rawChartData
    rawChartData = rawChartData.sort((a: SpecChartResponse, b: SpecChartResponse) => {
        // Convert the formatted dates back to Date objects
        const dateA = ConvertJsInfoServerFormatedDateToJsDateObject(a.date);
        const dateB = ConvertJsInfoServerFormatedDateToJsDateObject(b.date);

        // Compare the dates
        return dateA.getTime() - dateB.getTime();
    });

    const chartData: ChartJsLineChartData = {
        datasets: [],
    };

    const chartOptions: ChartJsLineChartOptions = ChartjsSetLastPointToLineInChartOptions({
        interaction: {
            mode: "index",
            intersect: false,
        },
        stacked: false,
        scales: {
            y: {
                type: "linear",
                display: true,
                position: "left",
                stacked: true,
            },
            y1: {
                type: "linear",
                display: true,
                position: "right",
                min: 0,
                max: 1.01,
                // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            y2: {
                type: "linear",
                display: false, // hide this axis
                stacked: false, // not stacked
            },
            x: {
                ticks: {
                    autoSkip: false,
                    maxTicksLimit: 200, // bigger then 6 * 30 - we store date up to 6 month ago
                    callback: (t, i) => {
                        // If there are less than 15 items, return the date for all
                        if (rawChartData.length < 15) {
                            return rawChartData[i]["date"];
                        }

                        // Otherwise, use the existing logic
                        return i % 5 && i != 0 && i + 1 != rawChartData.length
                            ? ""
                            : rawChartData[i]["date"];
                    }
                },
            },
        },
    });

    const specProviderToDatasetMap: ChartJsSpecIdToDatasetMap = {};
    let i = 0;

    let qosScoreData: ChartJsLineChartDataset = {
        label: "QoS Score",
        data: [],
        fill: false,
        borderColor: "#AAFF00",
        backgroundColor: "#AAFF00",
        yAxisID: "y1",
        borderDash: [30, 1],
    };

    let qosSyncData: ChartJsLineChartDataset = {
        label: "Sync Score",
        data: [],
        fill: false,
        borderColor: "#FFC53D",
        backgroundColor: "#FFC53D",
        yAxisID: "y1",
        borderDash: [30, 1],
    };

    let qosAvailabilityData: ChartJsLineChartDataset = {
        label: "Availability Score",
        data: [],
        fill: false,
        borderColor: "#46A758",
        backgroundColor: "#46A758",
        yAxisID: "y1",
        borderDash: [30, 1],
    };

    let qosLatencyData: ChartJsLineChartDataset = {
        label: "Latency Score",
        data: [],
        fill: false,
        borderColor: "#6E56CF",
        backgroundColor: "#6E56CF",
        yAxisID: "y1",
        borderDash: [30, 1],
    };

    const relayToCuChange = (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
        setIsRelayOrCuSelected(checked);
    };

    rawChartData.forEach((specChartResponse: SpecChartResponse) => {
        for (const specCuRelayItem of specChartResponse.data) {
            if (!specCuRelayItem.provider) continue;
            if (specProviderToDatasetMap[specCuRelayItem.provider] == undefined) {
                specProviderToDatasetMap[specCuRelayItem.provider] = {
                    label: !isRelayOrCuSelected ? specCuRelayItem.provider + " Relays" : specCuRelayItem.provider + " CUs",
                    data: [],
                    fill: false,
                    borderColor: CHARTJS_COLORS[i],
                    backgroundColor: CHARTJS_COLORS[i],
                    yAxisID: specCuRelayItem.provider === "All Providers" ? "y2" : "y",
                    borderDash: specCuRelayItem.provider === "All Providers" ? [15, 1] : undefined,
                };
                i++;
                if (i > CHARTJS_COLORS.length - 1) {
                    i = 0;
                }
            }
            specProviderToDatasetMap[specCuRelayItem.provider].data.push({
                x: specChartResponse.date,
                y: !isRelayOrCuSelected ? specCuRelayItem.relays : specCuRelayItem.cus,
            });
        }

        qosScoreData.data.push({
            x: specChartResponse.date,
            y: specChartResponse.qos,
        });

        qosSyncData.data.push({
            x: specChartResponse.date,
            y: specChartResponse.qosSyncAvg,
        });

        qosAvailabilityData.data.push({
            x: specChartResponse.date,
            y: specChartResponse.qosAvailabilityAvg,
        });

        qosLatencyData.data.push({
            x: specChartResponse.date,
            y: specChartResponse.qosLatencyAvg,
        });
    });

    chartData.datasets.push(qosScoreData);
    chartData.datasets.push(qosSyncData);
    chartData.datasets.push(qosAvailabilityData);
    chartData.datasets.push(qosLatencyData);

    for (const [key, value] of Object.entries(specProviderToDatasetMap)) {
        chartData.datasets.push(value);
    }

    ChartjsSetLastDotHighInChartData(chartData);

    return (
        <ChartJsReactiveLineChartWithDatePicker
            data={chartData}
            options={chartOptions}
            title="Qos Score & Relays/CUs for top 10 Providers"
            onDateChange={WrapSetDatesWithFormatingAnd6MonthFromLimit(setDates, initialRange)}
            rightControl={<TextToggle openText='CU sum' closeText='Relay sum' onChange={relayToCuChange} style={{ marginRight: '10px' }} />}
            datePickerValue={dates} />
    );
}
