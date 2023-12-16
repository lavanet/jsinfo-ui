import { GetRestUrl } from '../../src/utils';
import { Flex, Text, Card, Box, Tabs, Container } from '@radix-ui/themes';
import { SortableTableComponent } from '../../components/sorttable';

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

export default function Consumer({ consumer }) {
    if (consumer == undefined) {
        return (
            <div>Loading</div>
        )
    }

    const chartData = {
        datasets: [],
    }
    const metricData = []
    consumer.data.forEach((metric) => {
        metricData.push({ x: metric['date'], y: metric['relaySum'] })
    })
    chartData.datasets.push(
        {
            label: 'Relays',
            data: metricData,
            fill: true,
            borderColor: '#8c333a',
            backgroundColor: '#3b1219',
        }
    )

    console.log(consumer.subsBuy);

    return (
        <Container>
            <Card>
                <Flex gap="3" align="center">
                    <Box>
                        <Text as="div" size="2" weight="bold">
                            {consumer.addr}
                        </Text>
                        <Text as="div" size="2" color="gray">
                            Consumer
                        </Text>
                    </Box>
                </Flex>
            </Card>


            <Box>
                <Flex gap="3" justify="between">
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            cu sum: {consumer.cuSum}
                        </Text>
                    </Card>
                    <Card> 
                        <Text as="div" size="2" weight="bold">
                            relay sum: {consumer.relaySum}
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            pay sum: {consumer.rewardSum}
                        </Text>
                    </Card>
                </Flex>
            </Box>

            <Box>
                <Card>
                    <Line data={chartData}></Line>
                </Card>
            </Box>

            <Tabs.Root defaultValue="subscriptions">
                <Tabs.List>
                    <Tabs.Trigger value="subscriptions">Subscriptions</Tabs.Trigger>
                    <Tabs.Trigger value="conflicts">Conflicts</Tabs.Trigger>
                </Tabs.List>
                <Box px="4" pt="3" pb="2">

                    <SortableTableComponent
                        columns={[
                            { key: 'blockId', name: 'height' },
                            { key: 'duration', name: 'duration' },
                            { key: 'plan', name: 'plan' },
                        ]}
                        data={consumer.subsBuy} // assuming consumer is defined elsewhere
                        defaultSortKey='blockId'
                        tableValue='subscriptions'
                        pkey="consumer,blockId,plan"
                        pkey_url='none'
                    />

                    <SortableTableComponent
                        columns={[
                            { key: 'specId', name: 'specId' },
                            { key: 'requestBlock', name: 'requestBlock' },
                            { key: 'apiInterface', name: 'apiInterface' },
                            { key: 'connectionType', name: 'connectionType' },
                            { key: 'requestData', name: 'requestData' },
                            { key: 'apiURL', name: 'apiURL' },
                        ]}
                        data={consumer.conflicts}
                        defaultSortKey='requestBlock'
                        tableValue='conflicts'
                        pkey='id'
                        pkey_url='none'
                    />

                </Box>
            </Tabs.Root>

        </Container>
    )
}

export async function getStaticPaths() {
    return {
        paths: [],
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
    const consumer = await getConsumer(addr)
    if (consumer == null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            consumer
        },
        revalidate: 10,
    }
}

async function getConsumer(addr) {
    const res = await fetch(GetRestUrl() + '/consumer/' + addr)
    if (!res.ok) {
        return null
    }
    return res.json()
}
