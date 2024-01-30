import Link from 'next/link';
import { Flex, Text, Card, Box, Tabs } from '@radix-ui/themes';
import { EventTypeToString } from '../src/utils';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");
import { SortableTableComponent } from '../components/sorttable';

import { useCachedFetch } from '../src/hooks/useCachedFetch';
import Loading from '../components/loading';

export default function Events() {
    const { data, loading, error } = useCachedFetch('events');

    if (loading) return <Loading loadingText="Loading events page"/>;
    if (error) return <div>Error: {error}</div>;

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
                        <Tabs.Trigger value="events">Events</Tabs.Trigger>
                        <Tabs.Trigger value="rewards">Rewards</Tabs.Trigger>
                        <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
                    </Tabs.List>
                    <Box>
                        <SortableTableComponent
                            columns={[
                                { key: 'providers.address', name: 'Provider Address' },
                                { key: 'events.eventType', name: 'Event Type' },
                                { key: 'blocks.height', name: 'Block Height' },
                                { key: 'blocks.datetime', name: 'Time' },
                                { key: 'events.b1', name: 'b1' },
                                { key: 'events.b2', name: 'b2' },
                                { key: 'events.b3', name: 'b3' },
                                { key: 'events.i1', name: 'i1' },
                                { key: 'events.i2', name: 'i2' },
                                { key: 'events.i3', name: 'i3' },
                                { key: 'events.t1', name: 't1' },
                                { key: 'events.t2', name: 't2' },
                                { key: 'events.t3', name: 't3' },
                            ]}
                            data={data.events} 
                            defaultSortKey='blocks.datetime|desc'
                            tableName='events'
                            pkey='events.id'
                            pkeyUrl='none'
                            rowFormatters={{
                                "providers.address": (evt) => evt.providers
                                    ? <Link href={`/provider/${evt.providers.address}`}>
                                        {evt.providers.moniker ? evt.providers.moniker : evt.providers.address}
                                    </Link>
                                    : '',
                                "events.eventType": (evt) => <Link href={
                                    evt.events.tx
                                        ? `https://lava.explorers.guru/transaction/${evt.events.tx}`
                                        : `https://lava.explorers.guru/block/${evt.events.blockId}`
                                }>
                                    {EventTypeToString(evt.events.eventType)}
                                </Link>,
                                "blocks.height": (evt) => <Link href={`https://lava.explorers.guru/block/${evt.events.blockId}`}>
                                    {evt.events.blockId}
                                </Link>,
                                "blocks.datetime": (evt) => Dayjs(new Date(evt.blocks.datetime)).fromNow(),
                            }}
                        />

                        <SortableTableComponent
                            columns={[
                                { key: 'providers.address', name: 'Provider' },
                                { key: 'relay_payments.specId', name: 'Spec' },
                                { key: 'relay_payments.blockId', name: 'Block' },
                                { key: 'blocks.datetime', name: 'Time' },
                                { key: 'relay_payments.consumer', name: 'Consumer' },
                                { key: 'relay_payments.relays', name: 'Relays' },
                                { key: 'relay_payments.cu', name: 'CU' },
                                { key: 'relay_payments.pay', name: 'Pay' },
                                { key: 'relay_payments.qosSync', name: 'QoS' },
                                { key: 'relay_payments.qosSyncExc', name: 'Excellence' },
                            ]}
                            data={data.payments}
                            defaultSortKey='blocks.datetime|desc'
                            tableName='rewards'
                            pkey='relay_payments.id'
                            pkeyUrl='none'
                            rowFormatters={{
                                "providers.address": (payment) => payment.providers
                                    ? <Link href={`/provider/${payment.providers.address}`}>
                                        {payment.providers.moniker ? payment.providers.moniker : payment.providers.address}
                                    </Link>
                                    : '',
                                "relay_payments.specId": (payment) => <Link href={`/spec/${payment.relay_payments.specId}`}>
                                    {payment.relay_payments.specId}
                                </Link>,
                                "relay_payments.blockId": (payment) => <Link href={
                                    payment.relay_payments.tx
                                        ? `https://lava.explorers.guru/transaction/${payment.relay_payments.tx}`
                                        : `https://lava.explorers.guru/block/${payment.relay_payments.blockId}`
                                }>
                                    {payment.relay_payments.blockId}
                                </Link>,
                                "blocks.datetime": (payment) => Dayjs(new Date(payment.blocks.datetime)).fromNow(),
                                "relay_payments.consumer": (payment) => <Link href={`/consumer/${payment.relay_payments.consumer}`}>
                                    {payment.relay_payments.consumer}
                                </Link>,
                                "relay_payments.relays": (payment) => payment.relay_payments.relays,
                                "relay_payments.cu": (payment) => payment.relay_payments.cu,
                                "relay_payments.pay": (payment) => `${payment.relay_payments.pay} ULAVA`,
                                "relay_payments.qosSync": (payment) => `${payment.relay_payments.qosSync}, ${payment.relay_payments.qosAvailability}, ${payment.relay_payments.qosSync}`,
                                "relay_payments.qosSyncExc": (payment) => `${payment.relay_payments.qosSyncExc}, ${payment.relay_payments.qosAvailabilityExc}, ${payment.relay_payments.qosSyncExc}`,
                            }}
                        />

                        <SortableTableComponent
                            columns={[
                                { key: 'providers.address', name: 'Provider' },
                                { key: 'provider_reported.blockId', name: 'Block' },
                                { key: 'blocks.datetime', name: 'Time' },
                                { key: 'provider_reported.cu', name: 'CU' },
                                { key: 'provider_reported.disconnections', name: 'Disconnections' },
                                { key: 'provider_reported.errors', name: 'Errors' },
                                { key: 'provider_reported.project', name: 'Project' },
                            ]}
                            data={data.reports}
                            defaultSortKey='blocks.datetime|desc'
                            tableName='reports'
                            pkey='provider_reported.provider,provider_reported.blockId,counter'
                            pkeyUrl='none'
                            rowFormatters={{
                                "providers.address": (report) => report.providers
                                    ? <Link href={`/provider/${report.providers.address}`}>
                                        {report.providers.moniker ? report.providers.moniker : report.providers.address}
                                    </Link>
                                    : '',
                                "provider_reported.blockId": (report) => <Link href={
                                    report.provider_reported.tx
                                        ? `https://lava.explorers.guru/transaction/${report.provider_reported.tx}`
                                        : `https://lava.explorers.guru/block/${report.provider_reported.blockId}`
                                }>
                                    {report.provider_reported.blockId}
                                </Link>,
                                "blocks.datetime": (report) => Dayjs(new Date(report.blocks.datetime)).fromNow(),
                                "provider_reported.cu": (report) => report.provider_reported.cu,
                                "provider_reported.disconnections": (report) => report.provider_reported.disconnections,
                                "provider_reported.errors": (report) => report.provider_reported.errors,
                                "provider_reported.project": (report) => report.provider_reported.project,
                            }}
                        />

                    </Box>
                </Tabs.Root>
            </Card>

        </>
    )
}
