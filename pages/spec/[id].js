// pages/spec/[id].js

import Link from "next/link";
import { Flex, Text, Card, Box, Tabs } from "@radix-ui/themes";
import { ReactiveChart } from "../../components/ReactiveChart";
import { SortableTableInATabComponent } from "../../components/SortTable";

import {
  StatusToString,
  GeoLocationToString,
  SetLastDotHighInChartData,
  SetLastPointToLineInChartOptions,
} from "../../src/utils";

import BlockWithDateCard from "../../components/BlockWithDateCard";
import TitledCard from "../../components/TitledCard";
import { useCachedFetch } from "../../src/hooks/useCachedFetch";

const formatter = Intl.NumberFormat("en");

import LoadingIndicator from "../../components/LoadingIndicator";

import AnimatedTabsList from "../../components/AnimatedTabsList";

export default function Spec() {
  const { data, loading, error } = useCachedFetch({
    dataKey: "spec",
    useLastUrlPathInKey: true,
  });

  if (loading) return <LoadingIndicator loadingText="Loading spec page" />;
  if (error) return <div>Error: {error}</div>;

  const chartData = {
    datasets: [],
  };
  const chartOptions = SetLastPointToLineInChartOptions({
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
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
          callback: (t, i) =>
            i % 5 && i != 0 && i + 1 != data.qosData.length
              ? ""
              : data.qosData[i]["date"],
        },
      },
    },
  });

  const metricData = [];

  data.data.forEach((metric) => {
    metricData.push({ x: metric["date"], y: metric["relaySum"] });
  });

  chartData.datasets.push({
    label: data["specId"] + " Relays",
    data: metricData,
    fill: false,
    borderColor: "#8c333a",
    backgroundColor: "#8c333a",
  });

  let qosSync = {
    label: "Sync Score",
    data: [],
    fill: false,
    borderColor: "#FFC53D",
    backgroundColor: "#FFC53D",
    yAxisID: "y1",
  };
  let qosAvailability = {
    label: "Availability Score",
    data: [],
    fill: false,
    borderColor: "#46A758",
    backgroundColor: "#46A758",
    yAxisID: "y1",
  };
  let qosLatency = {
    label: "Latency Score",
    data: [],
    fill: false,
    borderColor: "#6E56CF",
    backgroundColor: "#6E56CF",
    yAxisID: "y1",
  };
  data.qosData.forEach((metric) => {
    qosSync.data.push({ x: metric["date"], y: metric["qosSyncAvg"] });
    qosAvailability.data.push({
      x: metric["date"],
      y: metric["qosAvailabilityAvg"],
    });
    qosLatency.data.push({ x: metric["date"], y: metric["qosLatencyAvg"] });
  });

  chartData.datasets.push(qosSync);
  chartData.datasets.push(qosAvailability);
  chartData.datasets.push(qosLatency);

  SetLastDotHighInChartData(chartData);

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <Card>
        <Flex gap="3" justify="between">
          <TitledCard title="spec" value={data.specId} />
          <TitledCard title="Providers" value={data.stakes.length} />
          <TitledCard title="CU" value={formatter.format(data.cuSum)} />
          <TitledCard title="Relays" value={formatter.format(data.relaySum)} />
          <TitledCard
            title="Rewards"
            value={`${formatter.format(data.rewardSum)} ULAVA`}
          />
        </Flex>
      </Card>
      <ReactiveChart data={chartData} options={chartOptions} />
      <Card>
        <Tabs.Root defaultValue="stakes">
          <AnimatedTabsList
            tabs={[
              {
                value: "stakes",
                content: "Stakes",
              },
            ]}
          />
          <Box>
            <SortableTableInATabComponent
              columns={[
                { key: "providers.address", name: "Provider" },
                { key: "provider_stakes.status", name: "Status" },
                { key: "provider_stakes.geolocation", name: "Geolocation" },
                { key: "provider_stakes.addons", name: "Addons" },
                { key: "provider_stakes.extensions", name: "Extensions" },
                { key: "provider_stakes.stake", name: "Stake" },
              ]}
              data={data.stakes}
              defaultSortKey="providers.address"
              tableAndTabName="stakes"
              pkey="provider_stakes.specId,provider_stakes.provider"
              pkeyUrl="none"
              rowFormatters={{
                "providers.address": (stake) => (
                  <Link href={`/provider/${stake.providers.address}`}>
                    {stake.providers.moniker
                      ? stake.providers.moniker
                      : stake.providers.address}
                  </Link>
                ),
                "provider_stakes.status": (stake) =>
                  StatusToString(stake.provider_stakes.status),
                "provider_stakes.geolocation": (stake) =>
                  GeoLocationToString(stake.provider_stakes.geolocation),
              }}
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
