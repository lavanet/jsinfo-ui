import { GetRestUrl } from '../utils';
import { Flex, Text, Card, Box, Table, Container } from '@radix-ui/themes';

export default function Consumer({ consumer }) {
    if (consumer == undefined) {
        return (
            <div>Loading</div>
        )
    }

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

            <Card>
                Conflicts
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>specId</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>requestBlock</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>apiInterface</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>connectionType</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>requestData</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>apiURL</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {consumer.conflicts.map((conflict) => {
                            return (<Table.Row key={`conflict_${conflict.id}`}>
                                <Table.RowHeaderCell>{conflict.specId}</Table.RowHeaderCell>
                                <Table.Cell>{conflict.blockId}</Table.Cell>
                                <Table.Cell>{conflict.requestBlock}</Table.Cell>
                                <Table.Cell>{conflict.apiInterface}</Table.Cell>
                                <Table.Cell>{conflict.connectionType}</Table.Cell>
                                <Table.Cell>{conflict.requestData}</Table.Cell>
                                <Table.Cell>{conflict.apiURL}</Table.Cell>
                            </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table.Root>
            </Card>


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
