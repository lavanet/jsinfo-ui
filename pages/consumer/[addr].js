import { Flex, Text, Card, Box, Tabs, Link } from "@radix-ui/themes";

import { useCachedFetch } from "../../src/hooks/useCachedFetch";

import { SortableTableInATabComponent } from "../../components/SortTable";
import { ReactiveChart } from "../../components/ReactiveChart";
import LoadingIndicator from "../../components/LoadingIndicator";
import TitledCard from "../../components/TitledCard";
import AnimatedTabsList from "../../components/AnimatedTabsList";
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

  if (loading) return <LoadingIndicator loadingText="Loading consumer page" />;
  if (error) return <div>Error: {error} </div>;

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
        <Flex gap="3" justify="between">
          <TitledCard title="cu sum" value={consumer.cuSum} />
          <TitledCard title="relay sum" value={consumer.relaySum} />
          <TitledCard title="pay sum" value={consumer.rewardSum} />
        </Flex>
      </Card>

      <ReactiveChart data={chartData} options={chartOptions} />
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
