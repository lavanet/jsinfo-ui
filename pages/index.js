import Link from 'next/link';
import { GetRestUrl } from './utils';
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

async function getData() {
  const res = await fetch(GetRestUrl() + '/latest')
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

Home.getInitialProps = async () => {
  const data = await getData()
  return { data: data }
}

export default function Home({ data }) {
  const chartData = {
    datasets: [],
  }
  const chartOptions = {
    scales: {
      y: {
        stacked: true,
      },
      x: {}
    }
  }

  const dsBySpecId = {}
  let i = 0
  data.data.forEach((metric) => {
    /*if ((metric['chainId'] != 'CELO') && (metric['chainId'] != 'ETH1')) {
      return
    }*/

    if (dsBySpecId[metric['chainId']] == undefined) {

      dsBySpecId[metric['chainId']] = {
        label: metric['chainId'],
        data: [],
        fill: false,
        borderColor: COLORS[i],
        backgroundColor: COLORS[i],
      }
      i++
      if (i > COLORS.length - 1) {
        i = 0
      }
    }
    dsBySpecId[metric['chainId']]['data'].push({ x: metric['date'], y: metric['relaySum'] })
  })

  for (const [key, value] of Object.entries(dsBySpecId)) {
    chartData.datasets.push(value)
  }

  return (
    <Container>

      <Card>
        <Flex gap="3" align="center">
          <Box>
            <Text as="div" size="2" weight="bold">
              Block {data.height}
            </Text>
            <Text as="div" size="2" color="gray">
              {(new Date(data.datetime)).toTimeString()}
            </Text>
          </Box>
        </Flex>
      </Card>

      <Box>
        <Flex gap="3" justify="between">
          <Card>
            <Text as="div" size="2" weight="bold">
              cu sum: {data.cuSum}
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              relay sum: {data.relaySum}
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              reward sum: {data.rewardSum}
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              stake sum: {data.stakeSum}
            </Text>
          </Card>
        </Flex>
      </Box>

      <Box>
        <Card>
          <Line data={chartData} options={chartOptions}></Line>
        </Card>
      </Box>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Provider Address</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Moniker</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total Rewards</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total Services</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.topProviders.map((provider) => {
              return (<Table.Row key={`provider_${provider.address}`}>
                <Table.RowHeaderCell><Link href={`/provider/${provider.addr}`}>{provider.addr}</Link></Table.RowHeaderCell>
                <Table.Cell>{provider.moniker}</Table.Cell>
                <Table.Cell>{provider.rewardSum}</Table.Cell>
                <Table.Cell>{provider.nStakes}</Table.Cell>
              </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Card>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Spec</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total Relays</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.allSpecs.map((spec) => {
              return (<Table.Row key={`spec_${spec.chainId}`}>
                <Table.RowHeaderCell><Link href={`/spec/${spec.chainId}`}>{spec.chainId}</Link></Table.RowHeaderCell>
                <Table.Cell>{spec.relaySum}</Table.Cell>
              </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Card>


    </Container>


  )
}
