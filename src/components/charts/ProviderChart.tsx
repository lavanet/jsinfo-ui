// src/components/charts/ProviderChart.tsx

import { RenderInFullPageCard } from "@jsinfo/lib/utils";
import { ConvertJsInfoServerFormatedDateToJsDateObject } from "@jsinfo/lib/dateutils";
import {
    CHARTJS_COLORS,
    ChartjsSetLastDotHighInChartData,
    ChartjsSetLastPointToLineInChartOptions,
    ChartJsLineChartOptions,
    ChartJsLineChartData,
    ChartJsLineChartDataset,
    ChartJsSpecIdToDatasetMap,
    ChartJsReactiveLineChartWithDatePicker
} from "@jsinfo/components/legacy/ChartJsReactiveLineChart";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import TextToggle from "@jsinfo/components/legacy/TextToggle";
import useApiDateFetch from "@jsinfo/hooks/useApiDateFetch";
import { useState } from "react";

type ProviderChartCuRelay = {
    specId: string;
    cus: number;
    relays: number;
};

type ProviderChartResponse = {
    data: ProviderChartCuRelay[];
} & ProviderQosData;

interface ProviderQosQueryData {
    date: string;
    qosSyncAvg: number;
    qosAvailabilityAvg: number;
    qosLatencyAvg: number;
}

type ProviderQosData = {
    qos: number;
} & ProviderQosQueryData;

interface ProviderChartProps {
    addr: string;
}

export default function ProviderChart({ addr }: ProviderChartProps) {

    const [isRelayOrCuSelected, setIsRelayOrCuSelected] = useState(false);

    const { data, loading, error, dates, setDates } = useApiDateFetch("providerCharts/" + addr);

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${addr} chart data`} greyText={`${addr} chart`} />);

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: ProviderChartResponse[] = data.data;

    rawChartData = rawChartData.sort((a: ProviderChartResponse, b: ProviderChartResponse) => {
        const dateA = ConvertJsInfoServerFormatedDateToJsDateObject(a.date);
        const dateB = ConvertJsInfoServerFormatedDateToJsDateObject(b.date);
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

    rawChartData.forEach((providerChartResponse: ProviderChartResponse) => {
        for (const specCuRelayItem of providerChartResponse.data) {
            if (!specCuRelayItem.specId) continue;
            if (specProviderToDatasetMap[specCuRelayItem.specId] == undefined) {
                specProviderToDatasetMap[specCuRelayItem.specId] = {
                    label: !isRelayOrCuSelected ? specCuRelayItem.specId + " Relays" : specCuRelayItem.specId + " CUs",
                    data: [],
                    fill: false,
                    borderColor: CHARTJS_COLORS[i],
                    backgroundColor: CHARTJS_COLORS[i],
                    yAxisID: specCuRelayItem.specId === "All Specs" ? "y2" : "y",
                    borderDash: specCuRelayItem.specId === "All Specs" ? [15, 1] : undefined,
                };
                i++;
                if (i > CHARTJS_COLORS.length - 1) {
                    i = 0;
                }
            }
            specProviderToDatasetMap[specCuRelayItem.specId].data.push({
                x: providerChartResponse.date,
                y: !isRelayOrCuSelected ? specCuRelayItem.relays : specCuRelayItem.cus,
            });
        }

        qosScoreData.data.push({
            x: providerChartResponse.date,
            y: providerChartResponse.qos,
        });

        qosSyncData.data.push({
            x: providerChartResponse.date,
            y: providerChartResponse.qosSyncAvg,
        });

        qosAvailabilityData.data.push({
            x: providerChartResponse.date,
            y: providerChartResponse.qosAvailabilityAvg,
        });

        qosLatencyData.data.push({
            x: providerChartResponse.date,
            y: providerChartResponse.qosLatencyAvg,
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
            title="Qos Score & Relays/CUs for provider"
            onDateChange={setDates}
            rightControl={<TextToggle openText='CU sum' closeText='Relay sum' onChange={relayToCuChange} style={{ marginRight: '10px' }} />}
            datePickerValue={dates} />
    );
}
