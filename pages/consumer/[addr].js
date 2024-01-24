import { Flex, Text, Card, Box, Tabs, Container } from '@radix-ui/themes';
import { SortableTableComponent } from '../../components/sorttable';
import { ReactiveChart } from '../../components/reactivechart';
import { useCachedFetchWithUrlKey } from '../../src/hooks/useCachedFetch';
import Loading from '../../components/loading';

export default function Consumer() {
    const { data, loading, error } = useCachedFetchWithUrlKey('consumer');
    
    if (loading) return <Loading loadingText="Loading consumer page"/>;
    if (error) return <div>Error: {error}</div>;

    const consumer = data;

    const chartOptions = {}
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

            <ReactiveChart data={chartData} options={chartOptions} />

            <Tabs.Root defaultValue="subscriptions">
                <Tabs.List>
                    <Tabs.Trigger value="subscriptions">Subscriptions</Tabs.Trigger>
                    <Tabs.Trigger value="conflicts">Conflicts</Tabs.Trigger>
                </Tabs.List>
                <Box>
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

