// src/charts/indexChart.tsx

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

type CuRelayItem = {
    chainId: string;
    cuSum: number;
    relaySum: number;
};

type IndexChartResponse = {
    date: string;
    qos: number;
    data: CuRelayItem[];
};


// export const fetchCache = 'force-no-store';
// export const dynamic = 'force-dynamic'

export default function IndexChart() {

    const [isRelayOrCuSelected, setIsRelayOrCuSelected] = useState(false);

    const today = new Date();

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const initialRange = { from: ninetyDaysAgo, to: today };

    const [dates, setDates] = useState<CachedFetchDateRange>(initialRange);

    const { data, loading, error } = useCachedFetch({ dataKey: "indexCharts", apiurlDateRangeQuery: { from: ConvertDateToServerQueryDate(dates.from), to: ConvertDateToServerQueryDate(dates.to) } });

    // Then in your render method or function component
    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading chart data`} greyText={`chart`} />);

    if (!Array.isArray(data.data) || data.data.length === 0) {
        return RenderInFullPageCard(<ErrorDisplay message={"No data for chart loaded"} />);
    }

    let rawChartData: IndexChartResponse[] = data.data;

    // First, sort the rawChartData
    rawChartData = rawChartData.sort((a: IndexChartResponse, b: IndexChartResponse) => {
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
        <ChartJsReactiveLineChartWithDatePicker
            data={chartData}
            options={chartOptions}
            title="Qos Score & Relays/CUs for top 10 Chains"
            onDateChange={WrapSetDatesWithFormatingAnd6MonthFromLimit(setDates, initialRange)}
            rightControl={<TextToggle openText='CU sum' closeText='Relay sum' onChange={relayToCuChange} style={{ marginRight: '10px' }} />}
            datePickerValue={dates} />
    );
}
