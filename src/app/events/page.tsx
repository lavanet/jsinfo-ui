// src/app/events/page.tsx
"use client";

import Link from 'next/link';
import { useEffect } from "react";
import { Card, Box } from "@radix-ui/themes";
import { EventTypeToString } from "@jsinfo/lib/convertors";
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/legacy/DynamicSortTable";
import { usePageContext } from "@jsinfo/context/PageContext";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import CsvButton from '@jsinfo/components/legacy/CsvButton';
import MonikerAndProviderLink from '@jsinfo/components/modern/MonikerAndProviderLink';
import { GetExplorersGuruUrl } from '@jsinfo/lib/env';

export default function Events() {

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('events');
  }, []);

  return (
    <>
      <Card>
        <JsinfoTabs defaultValue="events"
          tabs={[
            {
              value: "events",
              content: (
                <CsvButton
                  csvDownloadLink={`eventsEventsCsv`}
                >
                  Events
                </CsvButton>
              ),
            },
            {
              value: "rewards",
              content: (
                <CsvButton
                  csvDownloadLink={`eventsRewardsCsv`}
                >
                  Rewards
                </CsvButton>
              ),
            },
            {
              value: "reports",
              content: (
                <CsvButton
                  csvDownloadLink={`eventsReportsCsv`}
                >
                  Reports
                </CsvButton>
              ),
            },
          ]}
        >
          <Box>

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "provider", name: "Provider" },
                { key: "eventType", name: "Event" },
                { key: "blockId", name: "Height" },
                { key: "datetime", name: "Time" },
                { key: "t1", name: "Text1" },
                { key: "t2", name: "Text2" },
                { key: "t3", name: "Text3" },
                { key: "b1", name: "BigInt1" },
                { key: "b2", name: "BigInt2" },
                { key: "b3", name: "BigInt3" },
                { key: "i1", name: "Int1" },
                { key: "i2", name: "Int2" },
                { key: "i3", name: "Int3" },
              ]}
              dataKey="eventsEvents"
              defaultSortKey="id|desc"
              tableAndTabName="events"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                provider: (evt) => (<MonikerAndProviderLink provider={evt} />),
                eventType: (evt) => (
                  <Link className='orangelinks'
                    href={
                      evt.tx
                        ? `${GetExplorersGuruUrl()}/transaction/${evt.tx}`
                        : `${GetExplorersGuruUrl()}/block/${evt.blockId}`
                    }
                  >
                    {EventTypeToString(evt.eventType)}
                  </Link>
                ),
                blockId: (evt) => (
                  <Link className='orangelinks'
                    href={`${GetExplorersGuruUrl()}/block/${evt.blockId}`}
                  >
                    {evt.blockId}
                  </Link>
                ),
                datetime: (evt) => (<TimeTooltip datetime={evt.datetime} />),
                text1: (evt) => {
                  return (
                    <div
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {evt.t1}
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
                      {evt.t2}
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
                      {evt.t3}
                    </div>
                  );
                },
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "provider", name: "Provider" },
                { key: "specId", name: "Spec" },
                { key: "blockId", name: "Block" },
                { key: "datetime", name: "Time" },
                { key: "consumer", name: "Consumer" },
                { key: "relays", name: "Relays" },
                { key: "cu", name: "CU" },
                { key: "qosSync", name: "QoS" },
                { key: "qosSyncExc", name: "Excellence" },
              ]}
              dataKey={"eventsRewards"}
              defaultSortKey="id|desc"
              tableAndTabName="rewards"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                provider: (payment) => (<MonikerAndProviderLink provider={payment} />),
                specId: (payment) => (
                  <Link className='orangelinks' href={`/spec/${payment.specId}`}>
                    {payment.specId}
                  </Link>
                ),
                blockId: (payment) => (
                  <Link className='orangelinks'
                    href={
                      payment.tx
                        ? `${GetExplorersGuruUrl()}/transaction/${payment.tx}`
                        : `${GetExplorersGuruUrl()}/block/${payment.blockId}`
                    }
                  >
                    {payment.blockId}
                  </Link>
                ),
                datetime: (payment) => (<TimeTooltip datetime={payment.datetime} />),
                consumer: (payment) => (
                  <Link className='orangelinks' href={`/consumer/${payment.consumer}`}>
                    {payment.consumer}
                  </Link>
                ),
                relays: (payment) => payment.relays,
                cu: (payment) => payment.cu,
                pay: (payment) => `${payment.pay} ULAVA`,
                qosSync: (payment) => `${payment.qosSync}, ${payment.qosAvailability}, ${payment.qosSync}`,
                qosSyncExc: (payment) => `${payment.qosSyncExc}, ${payment.qosAvailabilityExc}, ${payment.qosSyncExc}`,
              }}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "provider", name: "Provider" },
                { key: "blockId", name: "Block" },
                { key: "datetime", name: "Time" },
                { key: "cu", name: "CU" },
                { key: "disconnections", name: "Disconnections" },
                { key: "errors", name: "Errors" },
                { key: "project", name: "Project" },
              ]}
              dataKey="eventsReports"
              defaultSortKey="id|desc"
              tableAndTabName="reports"
              pkey="provider,blockId"
              pkeyUrl="none"
              rowFormatters={{
                provider: (report) => (<MonikerAndProviderLink provider={report} />),
                blockId: (report) => (
                  <Link className='orangelinks'
                    href={
                      report.tx
                        ? `${GetExplorersGuruUrl()}/transaction/${report.tx}`
                        : `${GetExplorersGuruUrl()}/block/${report.blockId}`
                    }
                  >
                    {report.blockId}
                  </Link>
                ),
                datetime: (report) => (<TimeTooltip datetime={report.datetime} />),
                cu: (report) => report.cu,
                disconnections: (report) => report.disconnections,
                errors: (report) => report.errors,
                project: (report) => report.project,
              }}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
