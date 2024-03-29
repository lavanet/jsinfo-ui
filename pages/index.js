// jsinfo-ui/pages/index.js

import { Flex, Text, Card, Box, Tabs } from "@radix-ui/themes";
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");
import {
  SortableTableInATabComponent,
  DataKeySortableTableInATabComponent,
} from "../components/sorttable";
import { ReactiveChart } from "../components/reactivechart";
import React from "react";
import { useCachedFetch } from "../src/hooks/useCachedFetch";
import Loading from "../components/loading";
import {
  SetLastDotHighInChartData,
  SetLastPointToLineInChartOptions,
  ConvertToChainName,
} from "../src/utils";

import { GetRestUrl } from "../src/utils";

const COLORS = [
  "#191111",
  "#201314",
  "#3b1219",
  "#500f1c",
  "#611623",
  "#72232d",
  "#8c333a",
  "#b54548",
  "#e5484d",
  "#ec5d5e",
  "#ff9592",
  "#ffd1d9",
];

export default function Home() {
  const { data, loading, error } = useCachedFetch({ dataKey: "index" });

  if (loading) return <Loading loadingText="Loading page" />;
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
        stacked: true,
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
      y2: {
        type: "linear",
        display: false, // hide this axis
        stacked: false, // not stacked
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

  const dsBySpecId = {};
  let i = 0;
  data.data.forEach((metric) => {
    if (dsBySpecId[metric["chainId"]] == undefined) {
      dsBySpecId[metric["chainId"]] = {
        label: metric["chainId"] + " Relays",
        data: [],
        fill: false,
        borderColor: COLORS[i],
        backgroundColor: COLORS[i],
        yAxisID: metric["chainId"] === "All Chains" ? "y2" : "y",
      };
      i++;
      if (i > COLORS.length - 1) {
        i = 0;
      }
    }
    dsBySpecId[metric["chainId"]]["data"].push({
      x: metric["date"],
      y: metric["relaySum"],
    });
  });

  let qosData = {
    label: "QoS",
    data: [],
    fill: false,
    borderColor: "#AAFF00",
    backgroundColor: "#AAFF00",
    yAxisID: "y1",
  };
  data.qosData.forEach((metric) => {
    qosData.data.push({
      x: metric["date"],
      y:
        (metric["qosSyncAvg"] +
          metric["qosAvailabilityAvg"] +
          metric["qosLatencyAvg"]) /
        3,
    });
  });

  chartData.datasets.push(qosData);
  for (const [key, value] of Object.entries(dsBySpecId)) {
    chartData.datasets.push(value);
  }

  SetLastDotHighInChartData(chartData);

  function transformRelayDataForRelayTable(data) {
    if (!data) return [];
    const chainSums = {};
    data.forEach((item) => {
      if (!chainSums[item.chainId]) {
        chainSums[item.chainId] = {
          chainId: item.chainId,
          cuSum: 0,
          relaySum: 0,
        };
      }
      chainSums[item.chainId].cuSum += Number(item.cuSum);
      chainSums[item.chainId].relaySum += Number(item.relaySum);
    });
    return Object.values(chainSums).map((item) => ({
      chainId: item.chainId,
      cuSum: Math.round(item.cuSum),
      relaySum: Math.round(item.relaySum),
    }));
  }

  const transformedRelayDataForRelayTable = transformRelayDataForRelayTable(
    data.data
  );

  function transformSpecsData(data) {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      chainName: ConvertToChainName(item.chainId),
    }));
  }

  const transformedSpecData = transformSpecsData(data.allSpecs);

  return (
    <>
      <Card>
        <Flex gap="3" align="center">
          <Box>
            <Text size="2" weight="bold">
              Block {data.height}
            </Text>
            <Text size="2" color="gray">
              {" "}
              {Dayjs(new Date(data.datetime)).fromNow()}
            </Text>
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
              Stake: {formatter.format(data.stakeSum)} ULAVA
            </Text>
          </Card>
        </Flex>
      </Card>

      <ReactiveChart data={chartData} options={chartOptions} />

      <Card>
        <Tabs.Root defaultValue="providers">
          <Tabs.List>
            <Tabs.Trigger value="providers">
              Providers
              <a
                href={`${GetRestUrl()}/indexProvidersCsv`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  width="20"
                  height="20"
                  src="https://img.icons8.com/ios-filled/20/D3580C/export-csv.png"
                  alt="export-csv"
                  style={{ paddingLeft: "10px", paddingTop: "5px" }}
                />
              </a>
            </Tabs.Trigger>
            <Tabs.Trigger value="chains">Chains</Tabs.Trigger>
          </Tabs.List>
          <Box>
            <DataKeySortableTableInATabComponent
              columns={[
                { key: "moniker", name: "Moniker" },
                { key: "addr", name: "Provider Address" },
                { key: "rewardSum", name: "Total Rewards" },
                {
                  key: "totalServices",
                  name: "Total Services",
                  altKey: "nStakes",
                },
                { key: "totalStake", name: "Total Stake" },
              ]}
              defaultSortKey="totalStake|desc"
              tableAndTabName="providers"
              pkey="addr"
              pkeyUrl="provider"
              firstColumn="moniker"
              dataKey="indexProviders"
              useLastUrlPathInKey={false}
            />

            <SortableTableInATabComponent
              columns={[
                { key: "chainId", name: "Spec" },
                { key: "chainName", name: "Chain Name" },
                { key: "relaySum", name: "Total Relays" },
              ]}
              data={transformedSpecData}
              defaultSortKey="relaySum|desc"
              tableAndTabName="chains"
              pkey="chainId"
              pkeyUrl="spec"
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
