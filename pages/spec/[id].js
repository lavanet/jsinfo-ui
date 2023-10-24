import { GetRestUrl } from '../../src/utils';
import Link from 'next/link';
import { Flex, Text, Card, Box, Table, Container } from '@radix-ui/themes';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StatusToString, GeoLocationToString } from '../../src/utils';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

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
            <Box>
                <Card>
                    <Line data={chartData} options={chartOptions}></Line>
                </Card>
            </Box>
            <Card>
                Stakes
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Geolocation</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Addons</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Extensions</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Stake</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {spec.stakes.map((stake) => {
                            return (<Table.Row key={`${stake.provider_stakes.specId}${stake.provider_stakes.provider}`}>
                                <Table.Cell><Link href={`/provider/${stake.providers.address}`}>
                                    {stake.providers.moniker ? stake.providers.moniker : stake.providers.address}
                                </Link></Table.Cell>
                                <Table.Cell>{StatusToString(stake.provider_stakes.status)}</Table.Cell>
                                <Table.Cell>{GeoLocationToString(stake.provider_stakes.geolocation)}</Table.Cell>
                                <Table.Cell>{stake.provider_stakes.addons}</Table.Cell>
                                <Table.Cell>{stake.provider_stakes.extensions}</Table.Cell>
                                <Table.Cell>{stake.provider_stakes.stake}</Table.Cell>
                            </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table.Root>
            </Card>
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
