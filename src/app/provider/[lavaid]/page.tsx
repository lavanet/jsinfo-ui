// src/app/provider/[lavaid]/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Card, Box, Tabs } from "@radix-ui/themes";

import {
  StatusToString,
  GeoLocationToString,
  EventTypeToString,
} from "@jsinfo/common/convertors";

import { DataKeySortableTableInATabComponent } from "@jsinfo/components/SortTable";
import {
  ChartJsLineChartData,
  ChartJsLineChartDataset,
  ChartJsLineChartOptions,
  ChartJsReactiveLineChart,
  ChartJsSpecIdToDatasetMap
} from "@jsinfo/components/ChartJsReactiveLineChart";
import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";
import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";

import { FormatNumberWithString } from '@jsinfo/common/utils';

import {
  CHARTJS_COLORS,
  ChartjsSetLastDotHighInChartData,
  ChartjsSetLastPointToLineInChartOptions,
} from "@jsinfo/components/ChartJsReactiveLineChart";

import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import CsvButton from "@jsinfo/components/CsvButton";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import ProviderCard from "@jsinfo/components/ProviderCard";
import TitledCard from "@jsinfo/components/TitledCard";
import AnimatedTabsList from "@jsinfo/components/AnimatedTabsList";
import TimeTooltip from '@jsinfo/components/TimeTooltip';


export default function Provider({ params }: { params: { lavaid: string } }) {

  const { data, loading, error } = useCachedFetch({
    dataKey: "provider",
    useLastUrlPathInKey: true,
  });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('provider/' + params.lavaid);
    }
  }, [loading, error, params.lavaid, setCurrentPage]);

  if (loading) return <LoadingIndicator loadingText="Loading provider page" />;
  if (error) return <div>Error: {error}</div>;

  const provider = data;

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
      x: {
        ticks: {
          autoSkip: false,
          callback: (t, i) =>
            i % 5 && i != 0 && i + 1 != provider.qosData.length
              ? ""
              : provider.qosData[i]["date"],
        },
      },
    },
  });

  const specIdToDatasetMap: ChartJsSpecIdToDatasetMap = {};
  let i = 0;

  interface Metric {
    chainId: string;
    date: Date;
    relaySum: number;
    qosSyncAvg: number;
    qosAvailabilityAvg: number;
    qosLatencyAvg: number;
  }

  provider.data.forEach((metric: Metric) => {
    if (specIdToDatasetMap[metric.chainId] == undefined) {
      specIdToDatasetMap[metric.chainId] = {
        label: metric.chainId + " Relays",
        data: [],
        fill: false,
        borderColor: CHARTJS_COLORS[i],
        backgroundColor: CHARTJS_COLORS[i],
        yAxisID: "y",
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

  provider.qosData.forEach((metric: Metric) => {
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
  for (const [key, value] of Object.entries(specIdToDatasetMap)) {
    chartData.datasets.push(value);
  }

  ChartjsSetLastDotHighInChartData(chartData);

  const providerAddr = params.lavaid;

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <ProviderCard provider={provider} />
      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-5">
          <TitledCard
            title="CU"
            value={provider.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Relays"
            value={provider.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Rewards"
            value={`${provider.rewardSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Stake"
            value={`${provider.stakeSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Claimable Rewards"
            value={provider.claimableRewards.toUpperCase()}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </Card>

      <ChartJsReactiveLineChart data={chartData} options={chartOptions} />
      <Card>
        <Tabs.Root defaultValue="health">
          <AnimatedTabsList
            tabs={[
              {
                value: "health",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerHealthCsv/${providerAddr}`}
                  >
                    Health
                  </CsvButton>
                ),
              },
              {
                value: "errors",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerErrorsCsv/${providerAddr}`}
                  >
                    Errors
                  </CsvButton>
                ),
              },
              {
                value: "stakes",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerStakesCsv/${providerAddr}`}
                  >
                    Stakes
                  </CsvButton>
                ),
              },
              {
                value: "events",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerEventsCsv/${providerAddr}`}
                  >
                    Events
                  </CsvButton>
                ),
              },
              {
                value: "rewards",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerRewardsCsv/${providerAddr}`}
                  >
                    Rewards
                  </CsvButton>
                ),
              },
              {
                value: "reports",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerReportsCsv/${providerAddr}`}
                  >
                    Reports
                  </CsvButton>
                ),
              },
              {
                value: "delegatorRewards",
                content: (
                  <CsvButton
                    csvDownloadLink={`providerDelegatorRewardsCsv/${providerAddr}`}
                  >
                    Delegator Rewards
                  </CsvButton>
                ),
              },
            ]}
          />
          <Box>
            <DataKeySortableTableInATabComponent
              columns={[
                { key: "timestamp", name: "Time" },
                { key: "spec", name: "Spec" },
                { key: "interface", name: "Interface" },
                { key: "status", name: "Status" },
                { key: "message", name: "Message" },
              ]}
              dataKey="providerHealth"
              useLastUrlPathInKey={true}
              defaultSortKey="timestamp|desc"
              tableAndTabName="health"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                spec: (data) => (
                  <Link href={`/spec/${data.spec}`}>{data.spec}</Link>
                ),
                status: (data) =>
                  ["healthy", "unhealthy", "frozen"].includes(
                    data.status.toLowerCase()
                  ) ? (
                    <span
                      style={{
                        color:
                          data.status.toLowerCase() === "healthy"
                            ? "green"
                            : "red",
                      }}
                    >
                      {data.status}
                    </span>
                  ) : (
                    data.status
                  ),
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "date", name: "Date" },
                { key: "spec", name: "Spec" },
                { key: "error", name: "Error" },
              ]}
              dataKey="providerErrors"
              useLastUrlPathInKey={true}
              defaultSortKey="date|desc"
              tableAndTabName="errors"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                date: (data) => (<TimeTooltip datetime={data.date} />),
                error: (data) => {
                  return (
                    <div
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {data.error}
                    </div>
                  );
                },
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "events.eventType", name: "Event Type" },
                { key: "blocks.height", name: "Block Height" },
                { key: "blocks.datetime", name: "Time" },
                { key: "events.t1", name: "Text1" },
                { key: "events.t2", name: "Text2" },
                { key: "events.t3", name: "Text3" },
                { key: "events.b1", name: "BigInt1" },
                { key: "events.b2", name: "BigInt2" },
                { key: "events.b3", name: "BigInt3" },
                { key: "events.i1", name: "Int1" },
                { key: "events.i2", name: "Int2" },
                { key: "events.i3", name: "Int3" },
              ]}
              dataKey="providerEvents"
              useLastUrlPathInKey={true}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="events"
              pkey="events.id"
              pkeyUrl="none"
              rowFormatters={{
                "events.eventType": (evt) => (
                  <Link
                    href={
                      evt.events.tx
                        ? `https://lava.explorers.guru/transaction/${evt.events.tx}`
                        : `https://lava.explorers.guru/block/${evt.events.blockId}`
                    }
                  >
                    {EventTypeToString(evt.events.eventType)}
                  </Link>
                ),
                "blocks.height": (evt) => (
                  <Link
                    href={`https://lava.explorers.guru/block/${evt.events.blockId}`}
                  >
                    {evt.events.blockId}
                  </Link>
                ),
                "blocks.datetime": (evt) =>
                  (<TimeTooltip datetime={evt.blocks.datetime} />),
                text1: (evt) => {
                  return (
                    <div
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {evt.events.t1}
                    </div>
                  );
                },
                text2: (evt) => {
                  return (
                    <div
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {evt.events.t2}
                    </div>
                  );
                },
                text3: (evt) => {
                  return (
                    <div
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {evt.events.t3}
                    </div>
                  );
                },
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "specId", name: "Spec" },
                { key: "status", name: "Status" },
                { key: "geolocation", name: "Geolocation" },
                { key: "addons", name: "Addons" },
                { key: "extensions", name: "Extensions" },
                { key: "stake", name: "Stake" },
              ]}
              dataKey="providerStakes"
              useLastUrlPathInKey={true}
              defaultSortKey="specId"
              tableAndTabName="stakes"
              pkey="specId,provider"
              pkeyUrl="spec"
              rowFormatters={{
                specId: (stake) => (
                  <Link href={`/spec/${stake.specId}`}>{stake.specId}</Link>
                ),
                status: (stake) => StatusToString(stake.status),
                geolocation: (stake) => GeoLocationToString(stake.geolocation),
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "relay_payments.specId", name: "Spec" },
                { key: "relay_payments.blockId", name: "Block" },
                { key: "blocks.datetime", name: "Time" },
                { key: "relay_payments.consumer", name: "Consumer" },
                { key: "relay_payments.relays", name: "Relays" },
                { key: "relay_payments.cu", name: "CU" },
                { key: "relay_payments.qosSync", name: "QoS" },
                { key: "relay_payments.qosSyncExc", name: "Excellence" },
              ]}
              dataKey="providerRewards"
              useLastUrlPathInKey={true}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="rewards"
              pkey="relay_payments.id"
              pkeyUrl="none"
              rowFormatters={{
                "relay_payments.specId": (payment) => (
                  <Link href={`/spec/${payment.relay_payments.specId}`}>
                    {payment.relay_payments.specId}
                  </Link>
                ),
                "relay_payments.blockId": (payment) => (
                  <Link
                    href={
                      payment.relay_payments.tx
                        ? `https://lava.explorers.guru/transaction/${payment.relay_payments.tx}`
                        : `https://lava.explorers.guru/block/${payment.relay_payments.blockId}`
                    }
                  >
                    {payment.relay_payments.blockId}
                  </Link>
                ),
                "blocks.datetime": (payment) =>
                  (<TimeTooltip datetime={payment.blocks.datetime} />),
                "relay_payments.consumer": (payment) => (
                  <Link href={`/consumer/${payment.relay_payments.consumer}`}>
                    {payment.relay_payments.consumer}
                  </Link>
                ),
                "relay_payments.relays": (payment) =>
                  payment.relay_payments.relays,
                "relay_payments.cu": (payment) => payment.relay_payments.cu,
                "relay_payments.pay": (payment) =>
                  `${payment.relay_payments.pay} ULAVA`,
                "relay_payments.qosSync": (payment) =>
                  `${payment.relay_payments.qosSync}, ${payment.relay_payments.qosAvailability}, ${payment.relay_payments.qosSync}`,
                "relay_payments.qosSyncExc": (payment) =>
                  `${payment.relay_payments.qosSyncExc}, ${payment.relay_payments.qosAvailabilityExc}, ${payment.relay_payments.qosSyncExc}`,
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "provider_reported.blockId", name: "Block" },
                { key: "blocks.datetime", name: "Time" },
                { key: "provider_reported.cu", name: "CU" },
                {
                  key: "provider_reported.disconnections",
                  name: "Disconnections",
                },
                { key: "provider_reported.errors", name: "Errors" },
                { key: "provider_reported.project", name: "Project" },
              ]}
              dataKey="providerReports"
              useLastUrlPathInKey={true}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="reports"
              pkey="provider_reported.provider,provider_reported.blockId"
              pkeyUrl="none"
              rowFormatters={{
                "provider_reported.blockId": (report) => (
                  <Link
                    href={
                      report.provider_reported.tx
                        ? `https://lava.explorers.guru/transaction/${report.provider_reported.tx}`
                        : `https://lava.explorers.guru/block/${report.provider_reported.blockId}`
                    }
                  >
                    {report.provider_reported.blockId}
                  </Link>
                ),
                "blocks.datetime": (report) =>
                  (<TimeTooltip datetime={report.blocks.datetime} />),
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "timestamp", name: "Date" },
                { key: "chain_id", name: "Spec" },
                { key: "amount", name: "Amount" },
              ]}
              dataKey="providerDelegatorRewards"
              useLastUrlPathInKey={true}
              defaultSortKey="timestamp|desc"
              tableAndTabName="delegatorRewards"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                chain_id: (stake) => (
                  <Link href={`/spec/${stake.chain_id}`}>{stake.chain_id}</Link>
                ),
                amount: (data) => FormatNumberWithString(data.amount.toUpperCase()),
              }}
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
