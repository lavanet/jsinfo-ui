import Link from 'next/link';
import { GetRestUrl } from '../src/utils';
import { Flex, Text, Card, Box, Table, Tabs } from '@radix-ui/themes';
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

async function getData() {
  const res = await fetch(GetRestUrl() + '/index')
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

export default function Home({ data }) {
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
          callback: (t, i) => ((i % 5) && (i != 0) && (i + 1 != data.qosData.length)) ? '' : data.qosData[i]['date']
        },
      }
    }
  }

  const dsBySpecId = {}
  let i = 0
  data.data.forEach((metric) => {
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

  let qosData = {
    label: 'QoS',
    data: [],
    fill: false,
    borderColor: '#AAFF00',
    backgroundColor: '#AAFF00',
    yAxisID: 'y1',
  }
  data.qosData.forEach((metric) => {
    qosData.data.push({ x: metric['date'], y: (metric['qosSyncAvg'] + metric['qosAvailabilityAvg'] + metric['qosLatencyAvg']) / 3 })

  })
  chartData.datasets.push(qosData)
  for (const [key, value] of Object.entries(dsBySpecId)) {
    chartData.datasets.push(value)
  }

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
        <Flex gap="3" justify="between">
          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(data.relaySum)} Relays
            </Text>
          </Card>

          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(data.cuSum)} CU
            </Text>
          </Card>

          <Card>
            <Text as="div" size="2" weight="bold">
              Rewards: {formatter.format(data.rewardSum)} ULAVA
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              Stake: {formatter.format(data.stakeSum)} ULAVA
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
        <Tabs.Root defaultValue="providers">
          <Tabs.List>
            <Tabs.Trigger value="providers">providers</Tabs.Trigger>
            <Tabs.Trigger value="chains">chains</Tabs.Trigger>
          </Tabs.List>

          <Box px="4" pt="3" pb="2">
            <Tabs.Content value="providers">
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
                    if (provider.addr) {
                      return (
                        <Table.Row key={`provider_${provider.addr}`}>
                          <Table.RowHeaderCell><Link href={`/provider/${provider.addr}`}>{provider.addr}</Link></Table.RowHeaderCell>
                          <Table.Cell>{provider.moniker}</Table.Cell>
                          <Table.Cell>{provider.rewardSum}</Table.Cell>
                          <Table.Cell>{provider.nStakes}</Table.Cell>
                        </Table.Row>
                      )
                    }
                  })}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>

            <Tabs.Content value="chains">
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
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Card>
    </>
  )
}
