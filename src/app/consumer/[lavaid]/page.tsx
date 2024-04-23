// src/app/consumer/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Text, Card, Box, Tabs } from "@radix-ui/themes";
import dayjs from "dayjs";

import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import {
  ChartJsLineChartData,
  ChartJsLinePoint,
  ChartjsSetLastDotHighInChartData,
  ChartjsSetLastPointToLineInChartOptions,
} from "@jsinfo/components/ChartJsReactiveLineChart";

import { SortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { ChartJsReactiveLineChart } from "@jsinfo/components/ChartJsReactiveLineChart";

import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TitledCard from "@jsinfo/components/TitledCard";
import AnimatedTabsList from "@jsinfo/components/AnimatedTabsList";
import { useEffect } from "react";

import { usePageContext } from '@jsinfo/context/PageContext';

export default function Consumer({ params }: { params: { lavaid: string } }) {

  const { data, loading, error } = useCachedFetch({
    dataKey: "consumer",
    useLastUrlPathInKey: true,
  });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('consumer/' + params.lavaid);
    }
  }, [loading, error, params.lavaid, setCurrentPage]);

  if (error) return <div>Error: {error} </div>;
  if (loading) return <LoadingIndicator loadingText="Loading consumer page" />;

  const consumer = data;

  const chartOptions = ChartjsSetLastPointToLineInChartOptions({});

  const chartData: ChartJsLineChartData = {
    datasets: [],
  };

  const metricData: ChartJsLinePoint[] = [];

  interface Metric {
    date: Date
    relaySum: number
  }

  consumer.data.forEach((metric: Metric) => {
    const formattedDate = dayjs(metric.date).format("MMM D");
    metricData.push({ x: formattedDate, y: metric.relaySum });
  });

  chartData.datasets.push({
    label: "Relays",
    data: metricData,
    fill: true,
    borderColor: "#8c333a",
    backgroundColor: "#3b1219",
  });

  ChartjsSetLastDotHighInChartData(chartData);

  return (
    <>
      <Card>
        <Flex gap="3" align="center">
          <Box style={{ paddingLeft: "5px" }}>
            <Text as="div" size="2" color="gray">
              Consumer
            </Text>
            <Text as="div" size="2" weight="bold">
              {consumer.addr}
            </Text>
          </Box>
        </Flex>
      </Card>

      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3">
          <TitledCard
            title="Cu Sum"
            value={consumer.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Relay Sum"
            value={consumer.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Pay Sum"
            value={consumer.rewardSum}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </Card>

      <ChartJsReactiveLineChart data={chartData} options={chartOptions} />
      <Card>
        <Tabs.Root defaultValue="subscriptions">
          <AnimatedTabsList
            tabs={[
              {
                value: "subscriptions",
                content: "Subscriptions",
              },
              {
                value: "conflicts",
                content: "Conflicts",
              },
            ]}
          />
          <Box>
            <SortableTableInATabComponent
              columns={[
                { key: "blockId", name: "height" },
                { key: "duration", name: "duration" },
                { key: "plan", name: "plan" },
              ]}
              data={consumer.subsBuy}
              defaultSortKey="blockId"
              tableAndTabName="subscriptions"
              pkey="consumer,blockId,plan"
              pkeyUrl="none"
            />

            <SortableTableInATabComponent
              columns={[
                { key: "specId", name: "specId" },
                { key: "requestBlock", name: "requestBlock" },
                { key: "apiInterface", name: "apiInterface" },
                { key: "connectionType", name: "connectionType" },
                { key: "requestData", name: "requestData" },
                { key: "apiURL", name: "apiURL" },
              ]}
              data={consumer.conflicts}
              defaultSortKey="requestBlock"
              tableAndTabName="conflicts"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                specId: (data) => (
                  <Link href={`/spec/${data.specId}`}>{data.specId}</Link>
                ),
              }}
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}