// pages/provider/[addr].js

import Link from "next/link";
import { Flex, Text, Card, Box, Tabs } from "@radix-ui/themes";
import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
import {
  StatusToString,
  GeoLocationToString,
  EventTypeToString,
  SetLastDotHighInChartData,
  SetLastPointToLineInChartOptions,
} from "../../src/utils";
import {
  SortableTableInATabComponent,
  DataKeySortableTableInATabComponent,
} from "../../components/sorttable";
import { ReactiveChart } from "../../components/reactivechart";
import { useCachedFetch } from "../../src/hooks/useCachedFetch";
import Loading from "../../components/loading";

Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

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

export default function Provider() {
  const { data, loading, error } = useCachedFetch({
    dataKey: "provider",
    useLastUrlPathInKey: true,
  });

  if (loading) return <Loading loadingText="Loading provider page" />;
  if (error) return <div>Error: {error}</div>;

  const provider = data;

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

  const dsBySpecId = {};
  let i = 0;
  provider.data.forEach((metric) => {
    if (dsBySpecId[metric["chainId"]] == undefined) {
      dsBySpecId[metric["chainId"]] = {
        label: metric["chainId"] + " Relays",
        data: [],
        fill: false,
        borderColor: COLORS[i],
        backgroundColor: COLORS[i],
        yAxisID: "y",
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

  provider.qosData.forEach((metric) => {
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
  for (const [key, value] of Object.entries(dsBySpecId)) {
    chartData.datasets.push(value);
  }

  SetLastDotHighInChartData(chartData);

  return (
    <>
      <Card>
        <Flex gap="3" align="center">
          <Box>
            <Text size="2" weight="bold">
              Block {provider.height}
            </Text>
            <Text size="2" color="gray">
              {" "}
              {Dayjs(new Date(provider.datetime)).fromNow()}
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card>
        <Flex gap="3" align="center">
          <Box>
            <Text as="div" size="2" weight="bold">
              {provider.moniker}
            </Text>
            <Text as="div" size="2" color="gray">
              {provider.addr}
            </Text>
          </Box>
        </Flex>
      </Card>
      <Card>
        <Flex gap="3" justify="between">
          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(provider.cuSum)} CU
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(provider.relaySum)} Relays
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(provider.rewardSum)} ULAVA Rewards
            </Text>
          </Card>
          <Card>
            <Text as="div" size="2" weight="bold">
              {formatter.format(provider.stakeSum)} ULAVA Stake
            </Text>
          </Card>
        </Flex>
      </Card>
      <ReactiveChart data={chartData} options={chartOptions} />
      <Card>
        <Tabs.Root defaultValue="health">
          <Tabs.List>
            <Tabs.Trigger value="health">Health</Tabs.Trigger>
            <Tabs.Trigger value="stakes">Stakes</Tabs.Trigger>
            <Tabs.Trigger value="events">Events</Tabs.Trigger>
            <Tabs.Trigger value="rewards">Rewards</Tabs.Trigger>
            <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
          </Tabs.List>
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
              defaultSortKey="timestamp|desc"
              tableAndTabName="health"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                timestamp: (data) => Dayjs(new Date(data.timestamp)).fromNow(),
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

            <SortableTableInATabComponent
              columns={[
                { key: "events.eventType", name: "Event Type" },
                { key: "blocks.height", name: "Block Height" },
                { key: "blocks.datetime", name: "Time" },
                { key: "events.b1", name: "b1" },
                { key: "events.b2", name: "b2" },
                { key: "events.b3", name: "b3" },
                { key: "events.i1", name: "i1" },
                { key: "events.i2", name: "i2" },
                { key: "events.i3", name: "i3" },
                { key: "events.t1", name: "t1" },
                { key: "events.t2", name: "t2" },
                { key: "events.t3", name: "t3" },
              ]}
              data={provider.events}
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
                  Dayjs(new Date(evt.blocks.datetime)).fromNow(),
              }}
            />

            <SortableTableInATabComponent
              columns={[
                { key: "specId", name: "Spec" },
                { key: "status", name: "Status" },
                { key: "geolocation", name: "Geolocation" },
                { key: "addons", name: "Addons" },
                { key: "extensions", name: "Extensions" },
                { key: "stake", name: "Stake" },
              ]}
              data={provider.stakes}
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

            <SortableTableInATabComponent
              columns={[
                { key: "relay_payments.specId", name: "Spec" },
                { key: "relay_payments.blockId", name: "Block" },
                { key: "blocks.datetime", name: "Time" },
                { key: "relay_payments.consumer", name: "Consumer" },
                { key: "relay_payments.relays", name: "Relays" },
                { key: "relay_payments.cu", name: "CU" },
                // { key: 'relay_payments.pay', name: 'Pay' },
                { key: "relay_payments.qosSync", name: "QoS" },
                { key: "relay_payments.qosSyncExc", name: "Excellence" },
              ]}
              data={provider.payments}
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
                  Dayjs(new Date(payment.blocks.datetime)).fromNow(),
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

            <SortableTableInATabComponent
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
              data={provider.reports}
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
                  Dayjs(new Date(report.blocks.datetime)).fromNow(),
              }}
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
