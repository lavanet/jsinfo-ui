// src/charts/consumersChart.tsx

import { RenderInFullPageCard } from "@jsinfo/common/utils";
import { ConvertJsInfoServerFormatedDateToJsDateObject } from "@jsinfo/common/dateutils";
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
import useApiDateFetch from "@jsinfo/hooks/useApiDateFetch";

import { useState } from "react";

type CuRelayItem = {
    chainId: string;
    cuSum: number;
    relaySum: number;
};

type ConsumersChartResponse = {
    date: string;
    qos: number;
    data: CuRelayItem[];
};

export default function ConsumersChart() {
    const [isRelayOrCuSelected, setIsRelayOrCuSelected] = useState(false);

    const { data, loading, error, dates, setDates } = useApiDateFetch("consumerspageCharts");

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading consumers chart data`} greyText={`consumers chart`} />);

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: ConsumersChartResponse[] = data.data;

    rawChartData = rawChartData.sort((a: ConsumersChartResponse, b: ConsumersChartResponse) => {
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

    const specIdToDatasetMap: ChartJsSpecIdToDatasetMap = {};
    let i = 0;

    let qosData: ChartJsLineChartDataset = {
        label: "QoS Score",
        data: [],
        fill: false,
        borderColor: "#AAFF00",
        backgroundColor: "#AAFF00",
        yAxisID: "y1",
        borderDash: [30, 1],
    };

    const relayToCuChange = (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => {
        setIsRelayOrCuSelected(checked);
    };

    rawChartData.forEach((consumersChartResponse: ConsumersChartResponse) => {
        for (const cuRelayItem of consumersChartResponse.data) {
            if (!cuRelayItem.chainId) continue
            if (specIdToDatasetMap[cuRelayItem.chainId] == undefined) {
                specIdToDatasetMap[cuRelayItem.chainId] = {
                    label: !isRelayOrCuSelected ? cuRelayItem.chainId + " Relays" : cuRelayItem.chainId + " CUs",
                    data: [],
                    fill: false,
                    borderColor: CHARTJS_COLORS[i],
                    backgroundColor: CHARTJS_COLORS[i],
                    yAxisID: cuRelayItem.chainId === "All Chains" ? "y2" : "y",
                    borderDash: cuRelayItem.chainId === "All Chains" ? [15, 1] : undefined,
                };
                i++;
                if (i > CHARTJS_COLORS.length - 1) {
                    i = 0;
                }
            }
            specIdToDatasetMap[cuRelayItem.chainId].data.push({
                x: consumersChartResponse.date,
                y: !isRelayOrCuSelected ? cuRelayItem.relaySum : cuRelayItem.cuSum,
            });
        }

        qosData.data.push({
            x: consumersChartResponse.date,
            y: consumersChartResponse.qos,
        });
    });

    chartData.datasets.push(qosData);
    for (const [key, value] of Object.entries(specIdToDatasetMap)) {
        chartData.datasets.push(value);
    }

    ChartjsSetLastDotHighInChartData(chartData);

    return (
        <ChartJsReactiveLineChartWithDatePicker
            data={chartData}
            options={chartOptions}
            title="Qos Score & Relays/CUs for top 10 Chains"
            onDateChange={setDates}
            rightControl={<TextToggle openText='CU sum' closeText='Relay sum' onChange={relayToCuChange} style={{ marginRight: '10px' }} />}
            datePickerValue={dates} />
    );
}
