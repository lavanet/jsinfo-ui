import Link from 'next/link';
import { GetRestUrl } from '../src/utils';
import { Flex, Text, Card, Box, Table, Tabs } from '@radix-ui/themes';
import { StatusToString, GeoLocationToString, EventTypeToString } from '../src/utils';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

async function getData() {
    const res = await fetch(GetRestUrl() + '/events')
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export async function getStaticProps() {
    const data = await getData()
    return {
        props: {
            data
        },
        revalidate: 10,
    }
}

export default function Events({ data }) {
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
                <Tabs.Root defaultValue="events">
                    <Tabs.List>
                        <Tabs.Trigger value="events">events</Tabs.Trigger>
                        <Tabs.Trigger value="rewards">rewards</Tabs.Trigger>
                        <Tabs.Trigger value="reports">reports</Tabs.Trigger>
                    </Tabs.List>
                    <Box px="4" pt="3" pb="2">
                        <Tabs.Content value="events">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
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
                                    {data.events.map((evt) => {
                                        return (<Table.Row key={`evt_${evt.events.id}`}>
                                            <Table.Cell>
                                                {
                                                    evt.providers ? 
                                                    <Link href={`/provider/${evt.providers.address}`}>
                                                        {evt.providers.moniker}
                                                    </Link>
                                                    :
                                                    ''
                                                }
                                            </Table.Cell>
                                            <Table.RowHeaderCell>
                                                <Link href={
                                                    evt.events.tx ?
                                                        `https://lava.explorers.guru/transaction/${evt.events.tx}`
                                                        :
                                                        `https://lava.explorers.guru/block/${evt.events.blockId}`
                                                }>
                                                    {EventTypeToString(evt.events.eventType)}
                                                </Link>
                                            </Table.RowHeaderCell>
                                            <Table.Cell>
                                                <Link href={`https://lava.explorers.guru/block/${evt.events.blockId}`}>
                                                    {evt.events.blockId}
                                                </Link>
                                            </Table.Cell>
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

                        <Tabs.Content value="rewards">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
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
                                    {data.payments.map((payment) => {
                                        return (<Table.Row key={`pay_${payment.relay_payments.id}`}>
                                            <Table.Cell>
                                                {
                                                    payment.providers ? 
                                                    <Link href={`/provider/${payment.providers.address}`}>
                                                        {payment.providers.moniker}
                                                    </Link>
                                                    :
                                                    ''
                                                }
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Link href={`/spec/${payment.relay_payments.specId}`}>
                                                    {payment.relay_payments.specId}
                                                </Link>
                                            </Table.Cell>
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
                                        <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Block</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>CU</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Disconnections</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Errors</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {data.reports.map((report, i) => {
                                        return (<Table.Row key={`report_${report.provider_reported.provider}_${report.provider_reported.blockId}_${i}`}>
                                            <Table.Cell>
                                                {
                                                    report.providers ? 
                                                    <Link href={`/provider/${report.providers.address}`}>
                                                        {report.providers.moniker}
                                                    </Link>
                                                    :
                                                    ''
                                                }
                                            </Table.Cell>
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
