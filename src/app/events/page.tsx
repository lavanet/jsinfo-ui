// src/app/events/page.tsx
"use client";

import Link from 'next/link'
import { Card, Box, Tabs } from "@radix-ui/themes";

import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import { EventTypeToString } from "@jsinfo/common/convertors";
import { FormatTimeDifference } from "@jsinfo/common/utils";
import { SortableTableInATabComponent } from "@jsinfo/components/SortTable";

import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import AnimatedTabsList from "@jsinfo/components/AnimatedTabsList";
import { usePageContext } from "@jsinfo/context/PageContext";
import { useEffect } from "react";

export default function Events() {

  const { data, loading, error } = useCachedFetch({ dataKey: "events" });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('events');
    }
  }, [loading, error, setCurrentPage]);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <LoadingIndicator loadingText="Loading events page" />;

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <Card>
        <Tabs.Root defaultValue="events">
          <AnimatedTabsList
            tabs={[
              {
                value: "events",
                content: "Events",
              },
              {
                value: "rewards",
                content: "Rewards",
              },
              {
                value: "reports",
                content: "Reports",
              },
            ]}
          />
          <Box>
            <SortableTableInATabComponent
              columns={[
                { key: "providers.address", name: "Provider Address" },
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
              data={data.events}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="events"
              pkey="events.id"
              pkeyUrl="none"
              rowFormatters={{
                "providers.address": (evt) =>
                  evt.providers ? (
                    <Link href={`/provider/${evt.providers.address}`}>
                      {evt.providers.moniker
                        ? evt.providers.moniker
                        : evt.providers.address}
                    </Link>
                  ) : (
                    ""
                  ),
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
                  FormatTimeDifference(evt.blocks.datetime),
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

            <SortableTableInATabComponent
              columns={[
                { key: "providers.address", name: "Provider" },
                { key: "relay_payments.specId", name: "Spec" },
                { key: "relay_payments.blockId", name: "Block" },
                { key: "blocks.datetime", name: "Time" },
                { key: "relay_payments.consumer", name: "Consumer" },
                { key: "relay_payments.relays", name: "Relays" },
                { key: "relay_payments.cu", name: "CU" },
                { key: "relay_payments.qosSync", name: "QoS" },
                { key: "relay_payments.qosSyncExc", name: "Excellence" },
              ]}
              data={data.payments}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="rewards"
              pkey="relay_payments.id"
              pkeyUrl="none"
              rowFormatters={{
                "providers.address": (payment) =>
                  payment.providers ? (
                    <Link href={`/provider/${payment.providers.address}`}>
                      {payment.providers.moniker
                        ? payment.providers.moniker
                        : payment.providers.address}
                    </Link>
                  ) : (
                    ""
                  ),
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
                  FormatTimeDifference(payment.blocks.datetime),
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
                { key: "providers.address", name: "Provider" },
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
              data={data.reports}
              defaultSortKey="blocks.datetime|desc"
              tableAndTabName="reports"
              pkey="provider_reported.provider,provider_reported.blockId"
              pkeyUrl="none"
              rowFormatters={{
                "providers.address": (report) =>
                  report.providers ? (
                    <Link href={`/provider/${report.providers.address}`}>
                      {report.providers.moniker
                        ? report.providers.moniker
                        : report.providers.address}
                    </Link>
                  ) : (
                    ""
                  ),
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
                  FormatTimeDifference(report.blocks.datetime),
                "provider_reported.cu": (report) => report.provider_reported.cu,
                "provider_reported.disconnections": (report) =>
                  report.provider_reported.disconnections,
                "provider_reported.errors": (report) =>
                  report.provider_reported.errors,
                "provider_reported.project": (report) =>
                  report.provider_reported.project,
              }}
            />
          </Box>
        </Tabs.Root>
      </Card>
    </>
  );
}
