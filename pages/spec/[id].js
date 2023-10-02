import { GetRestUrl } from '../utils';
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
    const metricData = []
    spec.data.forEach((metric) => {
        metricData.push({ x: metric['date'], y: metric['relaySum'] })
    })
    chartData.datasets.push(
        {
            label: spec['specId'],
            data: metricData,
            fill: true,
            borderColor: '#8c333a',
            backgroundColor: '#3b1219',
        }
    )


    return (
        <Container>
            <Box>
                <Flex gap="3" justify="between">
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            spec: {spec.specId}
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            cu sum: {spec.cuSum}
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            relay sum: {spec.relaySum}
                        </Text>
                    </Card>
                    <Card>
                        <Text as="div" size="2" weight="bold">
                            reward sum: {spec.rewardSum}
                        </Text>
                    </Card>
                </Flex>
            </Box>
            <Box>
                <Card>
                    <Line data={chartData}></Line>
                </Card>
            </Box>
            <Card>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Provider Address</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Stake</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {spec.stakes.map((stake) => {
                            return (<Table.Row key={`provider_${stake.provider}`}>
                                <Table.RowHeaderCell><Link href={`/provider/${stake.provider}`}>{stake.provider}</Link></Table.RowHeaderCell>
                                <Table.Cell>{stake.stake}</Table.Cell>
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
