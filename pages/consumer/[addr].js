import { Flex, Text, Card, Box, Tabs } from "@radix-ui/themes";

import { useCachedFetch } from "../../src/hooks/useCachedFetch";

import { SortableTableInATabComponent } from "../../components/SortTable";
import { ReactiveChart } from "../../components/ReactiveChart";
import Loading from "../../components/Loading";

import dayjs from "dayjs";

import {
  SetLastDotHighInChartData,
  SetLastPointToLineInChartOptions,
} from "../../src/utils";

export default function Consumer() {
  const { data, loading, error } = useCachedFetch({
    dataKey: "consumer",
    useLastUrlPathInKey: true,
  });

  if (loading) return <Loading loadingText="Loading consumer page" />;
  if (error) return <div>Error: {error}</div>;

  const consumer = data;

  const chartOptions = SetLastPointToLineInChartOptions({});

  const chartData = {
    datasets: [],
  };

  const metricData = [];
  consumer.data.forEach((metric) => {
    const formattedDate = dayjs(metric["date"]).format("MMM D");
    metricData.push({ x: formattedDate, y: metric["relaySum"] });
  });

  chartData.datasets.push({
    label: "Relays",
    data: metricData,
    fill: true,
    borderColor: "#8c333a",
    backgroundColor: "#3b1219",
  });

  SetLastDotHighInChartData(chartData);

  return (
    <>
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

      <Card>
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
      </Card>

      <ReactiveChart data={chartData} options={chartOptions} />
      <Card>
        <Tabs.Root defaultValue="subscriptions">
          <Tabs.List>
            <Tabs.Trigger value="subscriptions">Subscriptions</Tabs.Trigger>
            <Tabs.Trigger value="conflicts">Conflicts</Tabs.Trigger>
          </Tabs.List>
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
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
