
// pages/spec/[id].js

import Link from 'next/link';
import { Flex, Text, Card, Box, Tabs } from '@radix-ui/themes';
import { ReactiveChart } from '../../components/reactivechart';
import { SortableTableComponent } from '../../components/sorttable';

import { StatusToString, GeoLocationToString } from '../../src/utils';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
import { useCachedFetch } from '../../src/hooks/useCachedFetch';

Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

import Loading from '../../components/loading';

export default function Spec() {
    const { data, loading, error } = useCachedFetch({ dataKey: 'spec', useLastUrlPathInKey: true });

    if (loading) return <Loading loadingText="Loading spec page"/>;
    if (error) return <div>Error: {error}</div>;

    const chartData = {
        datasets: [],
    }
    const chartOptions = {
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                max: 1.01,

                // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            x: {
                ticks: {
                    autoSkip: false,
                    callback: (t, i) => ((i % 5) && (i != 0) && (i + 1 != data.qosData.length)) ? '' : data.qosData[i]['date']
                },
            }
        },
        elements: {
            point: {
              // the last point is an estimation - make it small - make it be dotted just there is a little annoying
              // the property is applied on the whole chart line
              radius: function(context) {
                const index = context.dataIndex;
                const count = context.dataset.data.length;
                return index === count - 1 ? 2 : 1;  
              },
              pointStyle: function(context) {
                const index = context.dataIndex;
                const count = context.dataset.data.length;
                return index === count - 1 ? 'dash': 'circle';
              },
            },
        },
    }

    const metricData = []

    data.data.forEach((metric) => {
        metricData.push({ x: metric['date'], y: metric['relaySum'] })
    })

    chartData.datasets.push(
        {
            label: data['specId'] + ' Relays',
            data: metricData,
            fill: false,
            borderColor: '#8c333a',
            backgroundColor: '#8c333a',
        }
    )

    let qosSync = {
        label: 'Sync Score',
        data: [],
        fill: false,
        borderColor: '#FFC53D',
        backgroundColor: '#FFC53D',
        yAxisID: 'y1',
    }
    let qosAvailability = {
        label: 'Availability Score',
        data: [],
        fill: false,
        borderColor: '#46A758',
        backgroundColor: '#46A758',
        yAxisID: 'y1',
    }
    let qosLatency = {
        label: 'Latency Score',
        data: [],
        fill: false,
        borderColor: '#6E56CF',
        backgroundColor: '#6E56CF',
        yAxisID: 'y1',
    }
    data.qosData.forEach((metric) => {
        qosSync.data.push({ x: metric['date'], y: metric['qosSyncAvg'] })
        qosAvailability.data.push({ x: metric['date'], y: metric['qosAvailabilityAvg'] })
        qosLatency.data.push({ x: metric['date'], y: metric['qosLatencyAvg'] })
    })
    chartData.datasets.push(qosSync)
    chartData.datasets.push(qosAvailability)
    chartData.datasets.push(qosLatency)


// code to make the chart go up on the last dot by using max(median | average)
// Iterate over each dataset in the chart data
chartData.datasets.forEach(dataset => {
    // Get all data points except the last one
    const previousDataPoints = dataset.data.slice(0, -1);
  
    // Sort the data points in ascending order based on their 'y' value
    const sortedDataPoints = previousDataPoints.sort((a, b) => parseFloat(a.y) - parseFloat(b.y));
  
    // Calculate the index that represents the end of the lower half
    // By dividing by 1.5, we're actually considering the top two-thirds of the data
    const lowerThirdIndex = Math.floor(sortedDataPoints.length / 1.5);
  
    // Create a new array that excludes the lower third of the sorted data points
    const adjustedDataPoints = sortedDataPoints.slice(lowerThirdIndex);
  
    let median;
  
    // Calculate the median of the adjusted data points
    if (adjustedDataPoints.length % 2 === 0) {
        // If the number of adjusted data points is even, the median is the average of the two middle numbers
        median = (parseFloat(adjustedDataPoints[adjustedDataPoints.length / 2 - 1].y) + parseFloat(adjustedDataPoints[adjustedDataPoints.length / 2].y)) / 2;
    } else {
        // If the number of adjusted data points is odd, the median is the middle number
        median = parseFloat(adjustedDataPoints[(adjustedDataPoints.length - 1) / 2].y);
    }
  
    // Get the last data point in the dataset
    const lastDataPoint = dataset.data[dataset.data.length - 1];
  
    // Get the second last and third last data points in the dataset
    const secondLastDataPoint = dataset.data[dataset.data.length - 2];
    const thirdLastDataPoint = dataset.data[dataset.data.length - 3];
  
    // Calculate the average 'y' value of the second last and third last data points
    const previousDataPointAverage = (parseFloat(secondLastDataPoint.y) + parseFloat(thirdLastDataPoint.y) + parseFloat(lastDataPoint.y)) / 3;
  
    // Set the 'y' value of the last data point to be the higher of the median and the 'y' value of the previous data point
    // Multiply the higher value by 1.1 to ensure that the last data point is always 10% higher than the previous one
    lastDataPoint.y = Math.max(median, previousDataPointAverage);
  });

    return (
        <>
            <Card>
                <Flex gap="3" align="center">
                    <Box>
                        <Text size="2" weight="bold">
                            Block {data.height}
                        </Text>
                        <Text size="2" color="gray"> {Dayjs(new Date(data.datetime)).fromNow()}</Text>
                    </Box>
                </Flex>
            </Card>
            <Card>
                <Flex gap="3" justify="between">
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {data.specId} spec
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {data.stakes.length} Providers
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(data.cuSum)} CU
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(data.relaySum)} Relays
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(data.rewardSum)} ULAVA Rewards
                        </Text>
                    </Card>
                </Flex>
            </Card>
            <ReactiveChart data={chartData} options={chartOptions} />
            <Card>
                <Tabs.Root defaultValue="stakes">
                    <Tabs.List>
                        <Tabs.Trigger value="stakes">Stakes</Tabs.Trigger>
                    </Tabs.List>
                    <Box>
                        <SortableTableComponent
                            columns={[
                                { key: 'providers.address', name: 'Provider' },
                                { key: 'provider_stakes.status', name: 'Status' },
                                { key: 'provider_stakes.geolocation', name: 'Geolocation' },
                                { key: 'provider_stakes.addons', name: 'Addons' },
                                { key: 'provider_stakes.extensions', name: 'Extensions' },
                                { key: 'provider_stakes.stake', name: 'Stake' },
                            ]}
                            data={data.stakes}
                            defaultSortKey='providers.address'
                            tableName='stakes'
                            pkey="provider_stakes.specId,provider_stakes.provider"
                            pkeyUrl='none'
                            rowFormatters={{
                                "providers.address": (stake) => <Link href={`/provider/${stake.providers.address}`}>
                                    {stake.providers.moniker ? stake.providers.moniker : stake.providers.address}
                                </Link>,
                                "provider_stakes.status": (stake) => StatusToString(stake.provider_stakes.status),
                                "provider_stakes.geolocation": (stake) => GeoLocationToString(stake.provider_stakes.geolocation),
                            }}
                        />
                    </Box>
                </Tabs.Root>
            </Card>
        </>
    )
}



