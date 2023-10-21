import { GetRestUrl } from '../../src/utils';
import Link from 'next/link';
import { Flex, Text, Card, Box, Table, Container, Tabs } from '@radix-ui/themes';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

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

const COLORS = [
    '#191111',
    '#201314',
    '#3b1219',
    '#500f1c',
    '#611623',
    '#72232d',
    '#8c333a',
    '#b54548',
    '#e5484d',
    '#ec5d5e',
    '#ff9592',
    '#ffd1d9',
];

function eventTypeToString(evtType) {
    switch (evtType) {
        case (1):
            return 'Stake New Provider'
        case (2):
            return 'Stake Update Provider'
        case (3):
            return 'Provider Unstake Commit'
        case (4):
            return 'Freeze Provider'
        case (5):
            return 'Unfreeze Provider'
        case (6):
            return 'Add Key To Project'
        case (7):
            return 'Add Project To Subscription'
        case (8):
            return 'Conflict Detection Received'
        case (9):
            return 'Del Key From Project'
        case (10):
            return 'Del Project To Subscription'
        case (11):
            return 'Provider Jailed'
        case (12):
            return 'Vote Got Reveal'
        case (13):
            return 'Vote Reveal Started'
        case (14):
            return 'Detection Vote Resolved'
        case (15):
            return 'Detection Vote Unresolved'

        default:
            return 'Unknown Event Type'
    }
}

export default function Provider({ provider }) {
    if (provider == undefined) {
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
                stacked: true,
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
                    callback: (t, i) => ((i % 5) && (i != 0) && (i + 1 != provider.qosData.length)) ? '' : provider.qosData[i]['date']
                },
            }
        }
    }

    const dsBySpecId = {}
    let i = 0
    provider.data.forEach((metric) => {
        if (dsBySpecId[metric['chainId']] == undefined) {
            dsBySpecId[metric['chainId']] = {
                label: metric['chainId'],
                data: [],
                fill: false,
                borderColor: COLORS[i],
                backgroundColor: COLORS[i],
                yAxisID: 'y',
            }
            i++
            if (i > COLORS.length - 1) {
                i = 0
            }
        }
        dsBySpecId[metric['chainId']]['data'].push({ x: metric['date'], y: metric['relaySum'] })
    })

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
    provider.qosData.forEach((metric) => {
        qosSync.data.push({ x: metric['date'], y: metric['qosSyncAvg'] })
        qosAvailability.data.push({ x: metric['date'], y: metric['qosAvailabilityAvg'] })
        qosLatency.data.push({ x: metric['date'], y: metric['qosLatencyAvg'] })
    })
    chartData.datasets.push(qosSync)
    chartData.datasets.push(qosAvailability)
    chartData.datasets.push(qosLatency)
    for (const [key, value] of Object.entries(dsBySpecId)) {
        chartData.datasets.push(value)
    }

    return (
        <>

            <Card>
                <Flex gap="3" align="center">
                    <Box>
                        <Text size="2" weight="bold">
                            Block {provider.height}
                        </Text>
                        <Text size="2" color="gray"> {Dayjs(new Date(provider.datetime)).fromNow()}</Text>
                    </Box>
                </Flex>
            </Card>


            <Card>
                <Flex gap="3" align="center">
                    <Box>
                        <Text as="div" size="2" weight="bold">
                            {provider.moniker}
                        </Text>
                        <Text as="div" size="2" color="gray">
                            {provider.addr}
                        </Text>
                    </Box>
                </Flex>
            </Card>

            <Card>
                <Flex gap="3" justify="between">
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(provider.cuSum)} CU
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(provider.relaySum)} Relays
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(provider.rewardSum)} ULAVA Rewards
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            {formatter.format(provider.stakeSum)} ULAVA Stake
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
                <Tabs.Root defaultValue="events">
                    <Tabs.List>
                        <Tabs.Trigger value="events">events</Tabs.Trigger>
                        <Tabs.Trigger value="stakes">stakes</Tabs.Trigger>
                        <Tabs.Trigger value="rewards">rewards</Tabs.Trigger>
                        <Tabs.Trigger value="reports">reports</Tabs.Trigger>
                    </Tabs.List>

                    <Box px="4" pt="3" pb="2">
                        <Tabs.Content value="events">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Event Type</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Block</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>b1</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>b2</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>b3</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>i1</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>i2</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>i3</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>t1</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>t2</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>t3</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {provider.events.map((evt) => {
                                        return (<Table.Row key={`evt_${evt.events.id}`}>
                                            <Table.RowHeaderCell>
                                                <Link href={evt.events.tx ? `https://lava.explorers.guru/transaction/${evt.events.tx}` : `https://lava.explorers.guru/block/${evt.events.blockId}`}>{eventTypeToString(evt.events.eventType)}</Link>
                                            </Table.RowHeaderCell>
                                            <Table.Cell><Link href={`https://lava.explorers.guru/block/${evt.events.blockId}`}>{evt.events.blockId}</Link></Table.Cell>
                                            <Table.Cell>{Dayjs(new Date(evt.blocks.datetime)).fromNow()}</Table.Cell>
                                            <Table.Cell>{evt.events.b1}</Table.Cell>
                                            <Table.Cell>{evt.events.b2}</Table.Cell>
                                            <Table.Cell>{evt.events.b3}</Table.Cell>
                                            <Table.Cell>{evt.events.i1}</Table.Cell>
                                            <Table.Cell>{evt.events.i2}</Table.Cell>
                                            <Table.Cell>{evt.events.i3}</Table.Cell>
                                            <Table.Cell>{evt.events.t1}</Table.Cell>
                                            <Table.Cell>{evt.events.t2}</Table.Cell>
                                            <Table.Cell>{evt.events.t3}</Table.Cell>
                                        </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Tabs.Content>

                        <Tabs.Content value="stakes">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Spec</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Stake</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {provider.stakes.map((stake) => {
                                        return (<Table.Row key={`${stake.specId}${stake.provider}`}>
                                            <Table.RowHeaderCell>{stake.specId}</Table.RowHeaderCell>
                                            <Table.Cell>{stake.stake}</Table.Cell>
                                        </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Tabs.Content>

                        <Tabs.Content value="rewards">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Spec</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Block</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Consumer</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Relays</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>CU</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Pay</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>QoS</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Excellence</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {provider.payments.map((payment) => {
                                        return (<Table.Row key={`pay_${payment.relay_payments.id}`}>
                                            <Table.RowHeaderCell>
                                                <Link href={`/spec/${payment.relay_payments.specId}`}>
                                                    {payment.relay_payments.specId}
                                                </Link>
                                            </Table.RowHeaderCell>
                                            <Table.Cell>
                                                <Link href={
                                                    payment.relay_payments.tx ?
                                                        `https://lava.explorers.guru/transaction/${payment.relay_payments.tx}`
                                                        :
                                                        `https://lava.explorers.guru/block/${payment.relay_payments.blockId}`}>
                                                    {payment.relay_payments.blockId}
                                                </Link>
                                            </Table.Cell>
                                            <Table.Cell>{Dayjs(new Date(payment.blocks.datetime)).fromNow()}</Table.Cell>
                                            <Table.Cell><Link href={`/consumer/${payment.relay_payments.consumer}`}>{payment.relay_payments.consumer}</Link></Table.Cell>
                                            <Table.Cell>{payment.relay_payments.relays}</Table.Cell>
                                            <Table.Cell>{payment.relay_payments.cu}</Table.Cell>
                                            <Table.Cell>{payment.relay_payments.pay} ULAVA</Table.Cell>
                                            <Table.Cell>{payment.relay_payments.qosSync}, {payment.relay_payments.qosAvailability}, {payment.relay_payments.qosSync}</Table.Cell>
                                            <Table.Cell>{payment.relay_payments.qosSyncExc}, {payment.relay_payments.qosAvailabilityExc}, {payment.relay_payments.qosSyncExc}</Table.Cell>
                                        </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Tabs.Content>

                        <Tabs.Content value="reports">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Block</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>CU</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Disconnections</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Errors</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {provider.reports.map((report, i) => {
                                        return (<Table.Row key={`report_${report.provider_reported.provider}_${report.provider_reported.blockId}_${i}`}>
                                            <Table.Cell>
                                                <Link href={
                                                    report.provider_reported.tx ?
                                                        `https://lava.explorers.guru/transaction/${report.provider_reported.tx}`
                                                        :
                                                        `https://lava.explorers.guru/block/${report.provider_reported.blockId}`}>
                                                    {report.provider_reported.blockId}
                                                </Link>
                                            </Table.Cell>
                                            <Table.Cell>{Dayjs(new Date(report.blocks.datetime)).fromNow()}</Table.Cell>

                                            <Table.Cell>{report.provider_reported.cu}</Table.Cell>
                                            <Table.Cell>{report.provider_reported.disconnections}</Table.Cell>
                                            <Table.Cell>{report.provider_reported.errors}</Table.Cell>
                                            <Table.Cell>{report.provider_reported.project}</Table.Cell>
                                        </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Tabs.Content>
                    </Box>
                </Tabs.Root>
            </Card>
        </>
    )
}

export async function getStaticPaths() {
    const providers = await getProviders()
    let paths = []
    providers.providers.forEach(provider => {
        if (!provider.address) {
            return
        }
        paths.push({
            params: {
                addr: provider.address
            }
        })
    });

    return {
        paths: paths,
        fallback: true,
    };
}

export async function getStaticProps({ params }) {
    const addr = params.addr
    if (!addr.startsWith('lava@') || addr.length != 44) {
        return {
            notFound: true,
        }
    }

    // fetch
    const provider = await getProvider(params.addr)
    if (provider == null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            provider
        },
        revalidate: 15,
    }
}

async function getProviders() {
    const res = await fetch(GetRestUrl() + '/providers')
    if (!res.ok) {
        return null
    }
    return res.json()
}

async function getProvider(addr) {
    const res = await fetch(GetRestUrl() + '/provider/' + addr)
    if (!res.ok) {
        return null
    }
    return res.json()
}
