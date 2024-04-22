// src/app/spec/[specid]/page.tsx
"use client";

import { Flex, Card, Box, Tabs, Link } from "@radix-ui/themes";
import { useEffect } from "react";

import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import {
  ChartJsLineChartData,
  ChartJsLineChartDataset,
  ChartJsLineChartOptions,
  ChartJsLinePoint,
  ChartJsReactiveLineChart,
  ChartjsSetLastDotHighInChartData,
  ChartjsSetLastPointToLineInChartOptions,
} from "@jsinfo/components/ChartJsReactiveLineChart";

import { SortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/common/convertors";
import { usePageContext } from "@jsinfo/context/PageContext";

import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import TitledCard from "@jsinfo/components/TitledCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import AnimatedTabsList from "@jsinfo/components/AnimatedTabsList";

export default function Spec({ params }: { params: { specid: string } }) {

  const { data, loading, error } = useCachedFetch({
    dataKey: "spec",
    useLastUrlPathInKey: true,
  });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('spec/' + params.specid);
    }
  }, [loading, error, params.specid, setCurrentPage]);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <LoadingIndicator loadingText="Loading spec page" />;

  const chartData: ChartJsLineChartData = {
    datasets: [],
  };

  const chartOptions: ChartJsLineChartOptions = ChartjsSetLastPointToLineInChartOptions({
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

  const metricData: ChartJsLinePoint[] = [];

  interface Metric {
    date: Date
    relaySum: number
    qosSyncAvg: number
    qosAvailabilityAvg: number
    qosLatencyAvg: number
  }

  data.data.forEach((metric: Metric) => {
    metricData.push({ x: metric.date, y: metric.relaySum });
  });

  chartData.datasets.push({
    label: data["specId"] + " Relays",
    data: metricData,
    fill: false,
    borderColor: "#8c333a",
    backgroundColor: "#8c333a",
  });

  let qosSync: ChartJsLineChartDataset = {
    label: "Sync Score",
    data: [],
    fill: false,
    borderColor: "#FFC53D",
    backgroundColor: "#FFC53D",
    yAxisID: "y1",
  };
  let qosAvailability: ChartJsLineChartDataset = {
    label: "Availability Score",
    data: [],
    fill: false,
    borderColor: "#46A758",
    backgroundColor: "#46A758",
    yAxisID: "y1",
  };
  let qosLatency: ChartJsLineChartDataset = {
    label: "Latency Score",
    data: [],
    fill: false,
    borderColor: "#6E56CF",
    backgroundColor: "#6E56CF",
    yAxisID: "y1",
  };
  data.qosData.forEach((metric: Metric) => {
    qosSync.data.push({ x: metric.date, y: metric.qosSyncAvg });
    qosAvailability.data.push({
      x: metric.date,
      y: metric.qosAvailabilityAvg,
    });
    qosLatency.data.push({ x: metric.date, y: metric.qosLatencyAvg });
  });

  chartData.datasets.push(qosSync);
  chartData.datasets.push(qosAvailability);
  chartData.datasets.push(qosLatency);

  ChartjsSetLastDotHighInChartData(chartData);

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-5">
          <TitledCard
            title="spec"
            value={data.specId}
            className="col-span-1"
          />
          <TitledCard
            title="Providers"
            value={data.stakes.length}
            className="col-span-1"
          />
          <TitledCard
            title="CU"
            value={data.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Relays"
            value={data.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Rewards"
            value={`${data.rewardSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </Card>
      <ChartJsReactiveLineChart data={chartData} options={chartOptions} />
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
