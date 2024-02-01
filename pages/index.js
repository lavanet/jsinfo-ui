// jsinfo-ui/pages/index.js

import { Flex, Text, Card, Box, Tabs } from '@radix-ui/themes';
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");
import { SortableTableComponent } from '../components/sorttable';
import { ReactiveChart } from '../components/reactivechart';
import React from 'react';
import { useCachedFetch } from '../src/hooks/useCachedFetch';
import Loading from '../components/loading';

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

export default function Home() {
  const { data, loading, error } = useCachedFetch({ dataKey: 'index'});

  if (loading) return <Loading loadingText="Loading page" />;
  if (error) return <div>Error: {error}</div>;

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
    },
    elements: {
      point: {
        // the last point is an estimation - make it small - make it be dotted just there is a little annoying
        // the property is applied on the whole chart line
        radius: function(context) {
          const index = context.dataIndex;
          const count = context.dataset.data.length;
          return index === count - 1 ? 2 : 1;  
        },
        pointStyle: function(context) {
          const index = context.dataIndex;
          const count = context.dataset.data.length;
          return index === count - 1 ? 'dash': 'circle';
        },
      },
    },
  }

  const dsBySpecId = {}
  let i = 0
  data.data.forEach((metric) => {
    if (dsBySpecId[metric['chainId']] == undefined) {
      dsBySpecId[metric['chainId']] = {
        label: metric['chainId'] + ' Relays',
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

  chartData.datasets.forEach(dataset => {
    const previousDataPoints = dataset.data.slice(0, -1);
    const sortedDataPoints = previousDataPoints.sort((a, b) => parseFloat(a.y) - parseFloat(b.y));
    let median;

    if (sortedDataPoints.length % 2 === 0) {
      median = (parseFloat(sortedDataPoints[sortedDataPoints.length / 2 - 1].y) + parseFloat(sortedDataPoints[sortedDataPoints.length / 2].y)) / 2;
    } else {
      median = parseFloat(sortedDataPoints[(sortedDataPoints.length - 1) / 2].y);
    }

    const lastDataPoint = dataset.data[dataset.data.length - 1];
    lastDataPoint.y = median;
  });

  // console.log(chartData.datasets)

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

      <ReactiveChart data={chartData} options={chartOptions} />

      <Card>
        <Tabs.Root defaultValue="providers">
          <Tabs.List>
            <Tabs.Trigger value="providers">Providers</Tabs.Trigger>
            <Tabs.Trigger value="chains">Chains</Tabs.Trigger>
          </Tabs.List>
          <Box>
            <SortableTableComponent
              columns={[
                { key: 'moniker', name: 'Moniker' },
                { key: 'addr', name: 'Provider Address' },
                { key: 'rewardSum', name: 'Total Rewards' },
                { key: 'totalServices', name: 'Total Services', altKey: "nStakes" },
                { key: 'totalStake', name: 'Total Stake'},
              ]}
              data={data.topProviders}
              defaultSortKey='totalStake'
              tableName='providers'
              pkey='addr'
              pkeyUrl='provider'
              firstColumn='moniker'
            />

            <SortableTableComponent
              columns={[
                { key: 'chainId', name: 'Spec' },
                { key: 'relaySum', name: 'Total Relays' },
              ]}
              data={data.allSpecs}
              defaultSortKey='chainId'
              tableName='chains'
              pkey='chainId'
              pkeyUrl='spec'
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  )
}
