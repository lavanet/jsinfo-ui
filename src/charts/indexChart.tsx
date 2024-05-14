// src/charts/indexChart.tsx

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
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";

import { DateRange, useCachedFetch } from "@jsinfo/hooks/useCachedFetch";
import { Card } from "@radix-ui/themes";

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

const formatDate = (date: Date | string | null | undefined) => {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
        return date;
    } else {
        return null;
    }
};

let renderErrorOrLoading = (message: string | React.ReactNode) => {
    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '5px', marginRight: '5px', marginBottom: '15px', marginLeft: '5px' }}>
                {message}
            </div>
        </Card>
    );
}

function adjustDates(from: Date, to: Date): { from: Date, to: Date } {
    let today = new Date();
    console.log('Handling date change from:', from, 'to:', to);

    // Swap dates if 'from' is after 'to'
    if (from.getTime() > to.getTime()) {
        [from, to] = [to, from];
        console.log('Swapped dates. From:', from, 'To:', to);
    }

    // Limit 'from' to 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    if (from.getTime() < sixMonthsAgo.getTime()) {
        from = sixMonthsAgo;
        console.log('Adjusted "from" date to 6 months ago:', from);
    }

    // Limit 'to' to today
    if (to.getTime() > today.getTime()) {
        to = new Date(today);
        console.log('Adjusted "to" date to today:', to);
    }

    // Ensure 'from' and 'to' are at least 6 days apart
    const diffInDays = Math.ceil(Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    console.log('Difference in days:', diffInDays);
    if (diffInDays < 6) {
        from = new Date(to.getTime());
        from.setDate(to.getDate() - 6);
        console.log('Adjusted "from" date to ensure at least 6 days difference:', from);
    }

    return { from, to };
}

export function ParseDateItem(dateStr: string): Date {
    console.log(`Parsing date: ${dateStr}`);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let day: number, month: number, year: number;

    // Regular expression to match the day, month, and optional year parts of the date string
    const regex = new RegExp(`(\\d+)(${monthNames.join('|')})(\\d*)`);
    const matches = regex.exec(dateStr);

    if (!matches) {
        const error = new Error(`Failed to parse date: ${dateStr}`);
        console.error(error);
        throw error;
    }

    day = parseInt(matches[1], 10);
    if (isNaN(day) || day < 1 || day > 31) {
        const error = new Error(`Invalid day: ${matches[1]}`);
        console.error(error);
        throw error;
    }

    month = monthNames.indexOf(matches[2]);
    if (month === -1) {
        const error = new Error(`Invalid month: ${matches[2]}`);
        console.error(error);
        throw error;
    }

    year = matches[3] ? 2000 + parseInt(matches[3], 10) : new Date().getFullYear();
    if (isNaN(year) || year < 2000 || year > 2099) {
        const error = new Error(`Invalid year: ${matches[3]}`);
        console.error(error);
        throw error;
    }

    console.log(`Parsed day: ${day}, month: ${month}, year: ${year}`);
    return new Date(year, month, day);
}

export default function IndexChart() {

    const today = new Date();
    console.log('Today:', today);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    console.log('Ninety days ago:', ninetyDaysAgo);

    const initialRange = { from: ninetyDaysAgo, to: today };
    console.log('Initial range:', initialRange);

    const [dates, setDates] = useState<DateRange>(initialRange);
    console.log('Dates:', dates);

    const handleDateChange = (from: Date, to: Date) => {
        console.log('Handling date change from:', from, 'to:', to);

        // Use the adjustDates function to adjust the from and to dates
        const { from: adjustedFrom, to: adjustedTo } = adjustDates(from, to);

        const fromFormatted = formatDate(adjustedFrom);
        const toFormatted = formatDate(adjustedTo);
        console.log('Formatted dates:', fromFormatted, toFormatted);

        if (fromFormatted && toFormatted) {
            const diffInDays = Math.ceil(Math.abs(new Date(toFormatted).getTime() - new Date(fromFormatted).getTime()) / (1000 * 60 * 60 * 24));
            console.log('Difference in days:', diffInDays);

            if (diffInDays < 1) {
                setDates(initialRange);
                console.log('Setting dates to initial range:', initialRange);
            } else {
                const newDates = {
                    from: new Date(fromFormatted),
                    to: new Date(toFormatted)
                };
                setDates(newDates);
                console.log('Setting dates to:', newDates);
            }
        }
    };

    const { data, loading, error } = useCachedFetch({ dataKey: "indexCharts", apiurlDateRangeQuery: { from: formatDate(dates.from), to: formatDate(dates.to) } });
    console.log('useCachedFetch response:', { data, loading, error });

    // Then in your render method or function component
    if (error) return renderErrorOrLoading(`Error: ${error}`);
    if (loading) return renderErrorOrLoading(<LoadingIndicator loadingText="Loading chart data" />);

    let rawChartData: IndexChartResponse[] = data.data;

    // First, sort the rawChartData
    rawChartData = rawChartData.sort((a: IndexChartResponse, b: IndexChartResponse) => {
        // Convert the formatted dates back to Date objects
        const dateA = ParseDateItem(a.date);
        const dateB = ParseDateItem(b.date);

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
    };

    rawChartData.forEach((indexChartResponse: IndexChartResponse) => {
        for (const cuRelayItem of indexChartResponse.data) {
            if (specIdToDatasetMap[cuRelayItem.chainId] == undefined) {
                specIdToDatasetMap[cuRelayItem.chainId] = {
                    label: cuRelayItem.chainId + " Relays",
                    data: [],
                    fill: false,
                    borderColor: CHARTJS_COLORS[i],
                    backgroundColor: CHARTJS_COLORS[i],
                    yAxisID: cuRelayItem.chainId === "All Chains" ? "y2" : "y",
                };
                i++;
                if (i > CHARTJS_COLORS.length - 1) {
                    i = 0;
                }
            }
            specIdToDatasetMap[cuRelayItem.chainId].data.push({
                x: indexChartResponse.date,
                y: cuRelayItem.relaySum,
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
        <ChartJsReactiveLineChartWithDatePicker data={chartData} options={chartOptions} title="Qos Score & Relays for top 10 Chains" enableDatePicker={true} onDateChange={handleDateChange} datePickerValue={dates} />
    );
}
