import { GetRestUrl } from '../../src/utils';
import Link from 'next/link';
import { Flex, Text, Card, Box, Tabs } from '@radix-ui/themes';
import { ReactiveChart } from '../../components/reactivechart';
import { SortableTableComponent } from '../../components/sorttable';

import { StatusToString, GeoLocationToString } from '../../src/utils';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

export default function Spec({ spec }) {
    if (spec == undefined) {
        return (
            <div>Loading</div>
        )
    }

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
                    callback: (t, i) => ((i % 5) && (i != 0) && (i + 1 != spec.qosData.length)) ? '' : spec.qosData[i]['date']
                },
            }
        }
    }
    const metricData = []
    spec.data.forEach((metric) => {
        metricData.push({ x: metric['date'], y: metric['relaySum'] })
    })
    chartData.datasets.push(
        {
            label: spec['specId'] + ' Relays',
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
    spec.qosData.forEach((metric) => {
        qosSync.data.push({ x: metric['date'], y: metric['qosSyncAvg'] })
        qosAvailability.data.push({ x: metric['date'], y: metric['qosAvailabilityAvg'] })
        qosLatency.data.push({ x: metric['date'], y: metric['qosLatencyAvg'] })
    })
    chartData.datasets.push(qosSync)
    chartData.datasets.push(qosAvailability)
    chartData.datasets.push(qosLatency)

    return (
        <>
            <Card>
                <Flex gap="3" align="center">
                    <Box>
                        <Text size="2" weight="bold">
                            Block {spec.height}
                        </Text>
                        <Text size="2" color="gray"> {Dayjs(new Date(spec.datetime)).fromNow()}</Text>
                    </Box>
                </Flex>
            </Card>
            <Card>
                <Flex gap="3" justify="between">
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {spec.specId} spec
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {spec.stakes.length} Providers
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(spec.cuSum)} CU
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(spec.relaySum)} Relays
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(spec.rewardSum)} ULAVA Rewards
                        </Text>
                    </Card>
                </Flex>
            </Card>
            <ReactiveChart data={chartData} options={chartOptions} />
            <Tabs.Root defaultValue="stakes">
                <Tabs.List>
                    <Tabs.Trigger value="stakes">stakes</Tabs.Trigger>
                </Tabs.List>
                <Box px="4" pt="3" pb="2">
                    <SortableTableComponent
                        columns={[
                            { key: 'providers.address', name: 'Provider' },
                            { key: 'provider_stakes.status', name: 'Status' },
                            { key: 'provider_stakes.geolocation', name: 'Geolocation' },
                            { key: 'provider_stakes.addons', name: 'Addons' },
                            { key: 'provider_stakes.extensions', name: 'Extensions' },
                            { key: 'provider_stakes.stake', name: 'Stake' },
                        ]}
                        data={spec.stakes}
                        defaultSortKey='providers.address'
                        tableValue='stakes'
                        pkey="provider_stakes.specId,provider_stakes.provider"
                        pkey_url='none'
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
        </>
    )
}

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: true,
    };
}

export async function getStaticProps({ params }) {
    const specId = params.id
    if (specId.length <= 0) {
        return {
            notFound: true,
        }
    }

    // fetch
    const spec = await getSpec(specId)
    if (spec == null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            spec
        },
        revalidate: 10,
    }
}

async function getSpec(specId) {
    const res = await fetch(GetRestUrl() + '/spec/' + specId)
    if (!res.ok) {
        return null
    }
    return res.json()
}
