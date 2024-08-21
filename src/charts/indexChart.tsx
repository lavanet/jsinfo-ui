// src/charts/indexChart.tsx

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
} from "@jsinfo/components/ChartJsReactiveLineChart";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import ChartJsWithRadioToggle from "@jsinfo/components/ChartJsWithRadioToggle";
import useApiDateFetch from "@jsinfo/hooks/useApiDateFetch";

import { useState } from "react";

type CuRelayItem = {
    chainId: string;
    cuSum: number;
    relaySum: number;
};

type IndexChartResponse = {
    date: string;
    qos: number;
    uniqueVisitors: number;
    data: CuRelayItem[];
};

export default function IndexChart() {
    const [isRelayOrCuSelected, setIsRelayOrCuSelected] = useState(false);
    const [isUniqueVisitorsSelected, setIsUniqueVisitorsSelected] = useState(false);

    const { data, loading, error, dates, setDates } = useApiDateFetch("indexCharts");

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading chart data`} greyText={`chart`} />);

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: IndexChartResponse[] = data.data;

    rawChartData = rawChartData.sort((a: IndexChartResponse, b: IndexChartResponse) => {
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

    let uniqueVisitorData: ChartJsLineChartDataset = {
        label: "Unique Visitors",
        data: [],
        fill: false,
        borderColor: "#F1DF10",
        backgroundColor: "#F1DF10",
        yAxisID: "y",
        borderDash: [30, 1],
    };

    const chartChangeRadio = (value: any) => {
        if (value == 'CU sum') {
            setIsUniqueVisitorsSelected(false);
            setIsRelayOrCuSelected(false);
            return;
        }
        if (value == 'Relay sum') {
            setIsUniqueVisitorsSelected(false);
            setIsRelayOrCuSelected(true);
            return;
        }
        // if (value == 'Unique Visitors')
        setIsUniqueVisitorsSelected(true);
        return;
    };

    rawChartData.forEach((indexChartResponse: IndexChartResponse) => {
        if (isUniqueVisitorsSelected) {
            for (const cuRelayItem of indexChartResponse.data) {
                if (cuRelayItem.chainId != "All Chains") continue;
                if (specIdToDatasetMap["All Chains CUs"] == undefined) {
                    specIdToDatasetMap["All Chains CUs"] = {
                        label: "All Chains CUs",
                        data: [],
                        fill: false,
                        borderColor: CHARTJS_COLORS[i],
                        backgroundColor: CHARTJS_COLORS[i],
                        yAxisID: true ? "y2" : "y",
                        borderDash: true ? [15, 1] : undefined,
                    };
                    i++;
                    if (i > CHARTJS_COLORS.length - 1) {
                        i = 0;
                    }

                    specIdToDatasetMap["All Chains Relays"] = {
                        label: "All Chains Relays",
                        data: [],
                        fill: false,
                        borderColor: CHARTJS_COLORS[i],
                        backgroundColor: CHARTJS_COLORS[i],
                        yAxisID: true ? "y2" : "y",
                        borderDash: true ? [15, 1] : undefined,
                    };
                    i++;
                    if (i > CHARTJS_COLORS.length - 1) {
                        i = 0;
                    }
                }
                specIdToDatasetMap["All Chains CUs"].data.push({
                    x: indexChartResponse.date,
                    y: cuRelayItem.cuSum,
                });

                specIdToDatasetMap["All Chains Relays"].data.push({
                    x: indexChartResponse.date,
                    y: cuRelayItem.relaySum,
                });
            }

            qosData.data.push({
                x: indexChartResponse.date,
                y: indexChartResponse.qos,
            });

            uniqueVisitorData.data.push({
                x: indexChartResponse.date,
                y: indexChartResponse.uniqueVisitors,
            });

            return
        }


        for (const cuRelayItem of indexChartResponse.data) {
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
                x: indexChartResponse.date,
                y: !isRelayOrCuSelected ? cuRelayItem.relaySum : cuRelayItem.cuSum,
            });
        }

        qosData.data.push({
            x: indexChartResponse.date,
            y: indexChartResponse.qos,
        });
    });

    chartData.datasets.push(qosData);

    if (isUniqueVisitorsSelected) {
        chartData.datasets.push(uniqueVisitorData);
    }

    for (const [key, value] of Object.entries(specIdToDatasetMap)) {
        chartData.datasets.push(value);
    }


    ChartjsSetLastDotHighInChartData(chartData);

    return (
        <ChartJsWithRadioToggle
            data={chartData}
            options={chartOptions}
            title="QoS Score, Relays/CUs & Unique Visitors for Top 10 Chains"
            onDateChange={setDates}
            datePickerValue={dates}
            rangeOptions={['Unique Visitors', 'CU sum', 'Relay sum']}
            rangeOnChange={chartChangeRadio}
        />
    );
}
