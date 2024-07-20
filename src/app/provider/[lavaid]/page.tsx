// src/app/provider/[lavaid]/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Card, Box } from "@radix-ui/themes";
import {
  StatusToString,
  GeoLocationToString,
  EventTypeToString,
} from "@jsinfo/common/convertors";
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import { FormatNumber, FormatNumberWithString, RenderInFullPageCard } from '@jsinfo/common/utils';
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import ProviderCard from "@jsinfo/components/ProviderCard";
import TitledCard from "@jsinfo/components/TitledCard";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import StatusCall from '@jsinfo/components/StatusCell';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import ProviderChart from '@jsinfo/charts/providerChart';
import ProviderLatestHealthCards from '@jsinfo/components/ProviderLatestHealth';

export default function Provider({ params }: { params: { lavaid: string } }) {

  let decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return RenderInFullPageCard(<ErrorDisplay message={error} />);
  }

  const { data, loading, error } = useApiDataFetch({
    dataKey: "provider/" + decodedLavaId,
  });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('provider/' + decodedLavaId);
    }
  }, [loading, error, decodedLavaId, setCurrentPage]);

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${decodedLavaId} provider page`} greyText={`${decodedLavaId} provider`} />);

  const provider = data;

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <ProviderCard provider={provider} />
      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-4">
          <TitledCard
            title="Total CU"
            value={provider.cuSum}
            className="col-span-1"
            formatNumber={true}
            tooltip="Total compute units for provider"
          />
          <TitledCard
            title="Total Relays"
            value={provider.relaySum}
            className="col-span-1"
            formatNumber={true}
            tooltip="Total relays for provider"
          />
          <TitledCard
            title="Total Rewards"
            value={`${provider.rewardSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
            tooltip="Total rewards for provider"
          />
          <TitledCard
            title="Total Stake"
            value={`${provider.stakeSum} ULAVA`}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
            tooltip="Total stake for all specs"
          />
          {/* <TitledCard
            title="Claimable Rewards"
            value={provider.claimableRewards.toUpperCase()}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          /> */}
        </Flex>
      </Card>

      <ProviderChart addr={decodedLavaId} />

      <ProviderLatestHealthCards lavaId={decodedLavaId} />

      <Card>
        <JsinfoTabs defaultValue="health"
          tabs={[
            {
              value: "health",
              content: "Health",
            },
            {
              value: "errors",
              content: "Errors",
            },
            {
              value: "stakes",
              content: "Stakes",
            },
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
            {
              value: "blockReports",
              content: "Block Reports",
            },
            {
              value: "claimableProviderRewards",
              content: "Claimable Provider Rewards",
            },
          ]}
        >
          <Box>
            <DataKeySortableTableInATabComponent
              columns={[
                { key: "timestamp", name: "Time" },
                { key: "spec", name: "Spec" },
                { key: "interface", name: "Interface" },
                { key: "status", name: "Status" },
                { key: "region", name: "Region" },
                { key: "message", name: "Message" },
              ]}
              dataKey={`providerHealth/${decodedLavaId}`}
              defaultSortKey="id|desc"
              tableAndTabName="health"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                spec: (data) => (
                  <Link href={`/spec/${data.spec}`}>{data.spec}</Link>
                ),
                status: (data) => <StatusCall status={data.status} />,
              }}
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerHealthCsv/${decodedLavaId}`}
                />
              )}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "date", name: "Date" },
                { key: "spec", name: "Spec" },
                { key: "error", name: "Error" },
              ]}
              dataKey={`providerErrors/${decodedLavaId}`}
              defaultSortKey="id|desc"
              tableAndTabName="errors"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                date: (data) => (<TimeTooltip datetime={data.date} />),
                spec: (data) => (
                  <Link href={`/spec/${data.spec}`}>{data.spec}</Link>
                ),
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
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerStakesCsv/${decodedLavaId}`}
                />
              )}
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
              dataKey={`providerEvents/${decodedLavaId}`}
              defaultSortKey="events.id|desc"
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
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerEventsCsv/${decodedLavaId}`}
                />
              )}
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
              dataKey={`providerStakes/${decodedLavaId}`}
              defaultSortKey="specId"
              tableAndTabName="stakes"
              pkey="specId,provider"
              pkeyUrl="spec"
              rowFormatters={{
                specId: (data) => (
                  <Link href={`/spec/${data.specId}`}>{data.specId}</Link>
                ),
                status: (data) => <StatusCall status={StatusToString(data.status)} />,
                geolocation: (data) => GeoLocationToString(data.geolocation),
                stake: (data) => FormatNumber(data.stake),
              }}
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerEventsCsv/${decodedLavaId}`}
                />
              )}
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
              dataKey={`providerRewards/${decodedLavaId}`}
              defaultSortKey="relay_payments.id|desc"
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
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerRewardsCsv/${decodedLavaId}`}
                />
              )}
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
              dataKey={`providerReports/${decodedLavaId}`}
              defaultSortKey="provider_reported.id|desc"
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
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerReportsCsv/${decodedLavaId}`}
                />
              )}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "blockId", name: "Block" },
                { key: "timestamp", name: "Time" },
                { key: "chainId", name: "Chain" },
                { key: "chainBlockHeight", name: "Chain Block Height" },
              ]}
              dataKey={`providerBlockReports/${decodedLavaId}`}
              defaultSortKey="id|desc"
              tableAndTabName="blockReports"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                "blockId": (data) => (
                  <Link
                    href={
                      data.tx
                        ? `https://lava.explorers.guru/transaction/${data.tx}`
                        : `https://lava.explorers.guru/block/${data.blockId}`
                    }
                  >
                    {data.blockId}
                  </Link>
                ),
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                chainId: (stake) => (
                  <Link href={`/spec/${stake.chainId}`}>{stake.chainId}</Link>
                ),
                chainBlockHeight: (data) => FormatNumberWithString(data.chainBlockHeight),
              }}
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerBlockReportsCsv/${decodedLavaId}`}
                />
              )}
            />

            <DataKeySortableTableInATabComponent
              columns={[
                { key: "timestamp", name: "Time" },
                { key: "chainId", name: "Spec" },
                { key: "amount", name: "Amount" },
              ]}
              dataKey={`providerDelegatorRewards/${decodedLavaId}`}
              defaultSortKey="id|desc"
              tableAndTabName="claimableProviderRewards"
              pkey="id"
              pkeyUrl="none"
              rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                chainId: (data) => (
                  <Link href={`/spec/${data.chainId}`}>{data.chainId}</Link>
                ),
                amount: (data) => FormatNumberWithString(data.amount.toUpperCase()),
              }}
              csvButton={(
                <TableCsvButton
                  csvDownloadLink={`providerDelegatorRewardsCsv/${decodedLavaId}`}
                />
              )}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
