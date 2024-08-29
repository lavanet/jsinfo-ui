// src/components/charts/IndexChart.tsx

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
} from "@jsinfo/components/legacy/ChartJsReactiveLineChart";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import ChartJsWithRadioToggle from "@jsinfo/components/legacy/ChartJsWithRadioToggle";
import useApiDateFetch from "@jsinfo/hooks/useApiDateFetch";

import { useState } from "react";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";

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
    const [isUniqueVisitorsSelected, setIsUniqueVisitorsSelected] = useState(true);

    const { data, loading, error, dates, setDates } = useApiDateFetch("indexChartsV2");
    const uvfetch = useApiDataFetch({ dataKey: "indexUniqueVisitorsChart" });

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (uvfetch.error) return RenderInFullPageCard(<ErrorDisplay message={uvfetch.error} />);
    if (uvfetch.loading) return null;

    let uvfetchData: UniqueVisitorsData[] = uvfetch.data.data;

    console.log("uvfetchData", uvfetchData)
    if (!Array.isArray(uvfetchData) || uvfetchData.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    const chartChangeRadio = (value: any) => {
        if (value == 'By CU') {
            setIsUniqueVisitorsSelected(false);
            setIsRelayOrCuSelected(false);
            return;
        }
        if (value == 'By Relays') {
            setIsUniqueVisitorsSelected(false);
            setIsRelayOrCuSelected(true);
            return;
        }
        // if (value == 'Unique users')
        setIsUniqueVisitorsSelected(true);
        return;
    };

    if (isUniqueVisitorsSelected) {
        const uvfetchdata = uvfetchData.sort((a: UniqueVisitorsData, b: UniqueVisitorsData) => {
            const dateA = ConvertJsInfoServerFormatedDateToJsDateObject(a.date);
            const dateB = ConvertJsInfoServerFormatedDateToJsDateObject(b.date);
            return dateA.getTime() - dateB.getTime();
        });
        return UniqueVisitorsChart(uvfetchdata, chartChangeRadio);
    }

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: IndexChartResponse[] = data.data;

    rawChartData = rawChartData.sort((a: IndexChartResponse, b: IndexChartResponse) => {
        const dateA = ConvertJsInfoServerFormatedDateToJsDateObject(a.date);
        const dateB = ConvertJsInfoServerFormatedDateToJsDateObject(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading chart data`} greyText={`chart`} />);

    const chartData: ChartJsLineChartData = {
        datasets: [],
    };

    const chartOptions: ChartJsLineChartOptions = ChartjsSetLastPointToLineInChartOptions({
        interaction: {
            mode: "index",
            intersect: false,
        },
        stacked: true,
        plugins: {
            legend: {
                display: true
            }
        },
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
        yAxisID: "y",
        borderDash: [30, 1],
    };

    rawChartData.forEach((indexChartResponse: IndexChartResponse) => {
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

    for (const [key, value] of Object.entries(specIdToDatasetMap)) {
        chartData.datasets.push(value);
    }

    ChartjsSetLastDotHighInChartData(chartData);

    return (
        <ChartJsWithRadioToggle
            data={chartData}
            options={chartOptions}
            title="QoS Score, Relays/CUs for Top 10 Chains"
            onDateChange={setDates}
            datePickerValue={dates}
            rangeOptions={['Unique users', 'By Relays', 'By CU']}
            rangeOnChange={chartChangeRadio}
            chartKey={"RelayCuChart"}
        />
    );
}

interface UniqueVisitorsData {
    date: string;
    uniqueVisitors: number | null;
}

export function UniqueVisitorsChart(
    rawChartData: UniqueVisitorsData[],
    rangeOnChange: (value: any) => void
) {
    const chartData: ChartJsLineChartData = {
        datasets: [],
    };

    const chartOptions: ChartJsLineChartOptions = ChartjsSetLastPointToLineInChartOptions({
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            }
        },
        stacked: false,
        scales: {
            yuv: {
                type: "linear",
                display: true,
                position: "left",
                stacked: true,
            },
            xuv: {
                ticks: {
                    autoSkip: false,
                    maxTicksLimit: 200, // bigger then 6 * 30 - we store date up to 6 month ago
                    callback: (t, i) => {
                        if (!rawChartData[i]) return undefined;

                        // If there are less than 15 items, return the date for all
                        if (rawChartData.length < 15) {
                            return rawChartData[i]["date"];
                        }

                        // Otherwise, use the existing logic
                        return i % 2 && i != 0 && i + 1 != rawChartData.length
                            ? ""
                            : rawChartData[i]["date"];
                    }
                },
            },
        },
    });

    let uniqueVisitorData: ChartJsLineChartDataset = {
        label: "Unique users",
        data: [],
        fill: false,
        borderColor: "#F1DF10",
        backgroundColor: "#F1DF10",
        yAxisID: "yuv",
        xAxisID: "xuv",
        borderDash: [30, 1],
    };

    rawChartData.forEach((indexChartResponse: UniqueVisitorsData) => {
        if (indexChartResponse.uniqueVisitors) {
            uniqueVisitorData.data.push({
                x: indexChartResponse.date,
                y: indexChartResponse.uniqueVisitors,
            });
        }
    });

    chartData.datasets.push(uniqueVisitorData);

    ChartjsSetLastDotHighInChartData(chartData);

    return (
        <ChartJsWithRadioToggle
            data={chartData}
            options={chartOptions}
            title="Unique users (30 days)"
            noDatePicker={true}
            rangeOptions={['Unique users', 'By Relays', 'By CU']}
            rangeOnChange={rangeOnChange}
            chartKey={"UniqueUsersChart"}
        />
    );
}

