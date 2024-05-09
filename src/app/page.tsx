// src/app/page.tsx
"use client";

import React from "react";
import { useEffect } from "react";

import { Flex, Card, Box } from "@radix-ui/themes";

import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import CsvButton from "@jsinfo/components/CsvButton";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TitledCard from "@jsinfo/components/TitledCard";

import {
  CHARTJS_COLORS,
  ChartJsReactiveLineChart,
  ChartjsSetLastDotHighInChartData,
  ChartjsSetLastPointToLineInChartOptions,
  ChartJsLineChartOptions,
  ChartJsLineChartData,
  ChartJsLineChartDataset,
  ChartJsSpecIdToDatasetMap
} from "@jsinfo/components/ChartJsReactiveLineChart";

import {
  SortableTableInATabComponent,
  DataKeySortableTableInATabComponent,
} from "@jsinfo/components/SortTable";

import { ConvertToChainName } from "@jsinfo/common/convertors";
import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import { usePageContext } from "@jsinfo/context/PageContext";
import { FormatNumber } from "@jsinfo/common/utils";
// import RangeDatePicker from "@jsinfo/components/RangeDatePicker";

export default function Home() {

  const { data, loading, error } = useCachedFetch({ dataKey: "index" });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('home');
    }
  }, [loading, error, setCurrentPage]);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <LoadingIndicator loadingText="Loading page" />;

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

  const specIdToDatasetMap: ChartJsSpecIdToDatasetMap = {};
  let i = 0;

  interface Metric {
    chainId: string;
    date: string;
    relaySum: number;
  }

  data.data.forEach((metric: Metric) => {
    if (specIdToDatasetMap[metric.chainId] == undefined) {
      specIdToDatasetMap[metric.chainId] = {
        label: metric.chainId + " Relays",
        data: [],
        fill: false,
        borderColor: CHARTJS_COLORS[i],
        backgroundColor: CHARTJS_COLORS[i],
        yAxisID: metric.chainId === "All Chains" ? "y2" : "y",
      };
      i++;
      if (i > CHARTJS_COLORS.length - 1) {
        i = 0;
      }
    }
    specIdToDatasetMap[metric.chainId].data.push({
      x: metric.date,
      y: metric.relaySum,
    });
  });

  let qosData: ChartJsLineChartDataset = {
    label: "QoS",
    data: [],
    fill: false,
    borderColor: "#AAFF00",
    backgroundColor: "#AAFF00",
    yAxisID: "y1",
  };

  interface QosMetric {
    date: string;
    qosSyncAvg: number;
    qosAvailabilityAvg: number;
    qosLatencyAvg: number;
  }

  data.qosData.forEach((metric: QosMetric) => {
    qosData.data.push({
      x: metric.date,
      y: (metric.qosSyncAvg + metric.qosAvailabilityAvg + metric.qosLatencyAvg) / 3,
    });
  });

  chartData.datasets.push(qosData);
  for (const [key, value] of Object.entries(specIdToDatasetMap)) {
    chartData.datasets.push(value);
  }

  ChartjsSetLastDotHighInChartData(chartData);
  interface Item {
    chainId: string;
    [key: string]: any;
  }

  function transformSpecsData(data: Item[]) {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      chainName: ConvertToChainName(item.chainId),
    }));
  }

  const transformedSpecData = transformSpecsData(data.allSpecs);

  return (
    <>
      <BlockWithDateCard blockData={data} />

      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3 ">
          <TitledCard
            title="Relays"
            value={data.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="CU"
            value={data.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Stake"
            value={`${data.stakeSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </Card>

      {/* <RangeDatePicker /> */}
      <ChartJsReactiveLineChart data={chartData} options={chartOptions} />

      <Card>
        <JsinfoTabs defaultValue="providers"
          tabs={[
            {
              value: "providers",
              content: (
                <CsvButton
                  csvDownloadLink="indexProvidersCsv"
                >
                  Providers
                </CsvButton>
              ),
            },
            {
              value: "chains",
              content: "Chains",
            },
          ]}
        >
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
              rowFormatters={{
                rewardSum: (data) => FormatNumber(data.rewardSum),
                totalStake: (data) => FormatNumber(data.totalStake),
              }}
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
              rowFormatters={{
                relaySum: (data) => FormatNumber(data.relaySum),
              }}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
