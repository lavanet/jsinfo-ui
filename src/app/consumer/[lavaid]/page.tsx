// src/app/consumer/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import { useEffect } from "react";
import { usePageContext } from '@jsinfo/context/PageContext';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import { RenderInFullPageCard } from '@jsinfo/lib/utils';
import ConsumerChart from '@jsinfo/components/charts/ConsumerChart';
import ConsumerSubscriptionsTable from './_components/ConsumersSubscriptionsTab';
import ConsumersEventsTab from './_components/ConsumersEventsTab';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, ArrowUpNarrowWide, CreditCard } from 'lucide-react';
import LegacyTheme from '@jsinfo/components/legacy/LegacyTheme';

export default function Consumer({ params }: { params: { lavaid: string } }) {

  let decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return <ErrorDisplay message={error} />;
  }

  const { data, loading, error } = useApiFetch('consumer/' + decodedLavaId);

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('consumer/' + decodedLavaId);
    }
  }, [loading, error, decodedLavaId, setCurrentPage]);

  if (error) return <ErrorDisplay message={error} />;
  if (loading) return <LoadingIndicator loadingText={`Loading ${decodedLavaId} consumer page`} greyText={`${decodedLavaId} consumer`} />;

  const consumer = data;

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

      <div style={{ marginTop: '25px' }}></div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <StatCard
          title="Cu Sum"
          value={consumer.cuSum}
          className="col-span-1"
          formatNumber={true}
          icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Relay Sum"
          value={consumer.relaySum}
          className="col-span-1"
          formatNumber={true}
          icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Pay Sum"
          value={consumer.rewardSum}
          className="col-span-2 md:col-span-1"
          formatNumber={true}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div style={{ marginTop: '25px' }}></div>

      <LegacyTheme>
        <ConsumerChart addr={decodedLavaId} />
        <div className="box-margin-div"></div>

        <Card>
          <JsinfoTabs defaultValue="subscriptions"
            tabs={[
              {
                value: "subscriptions",
                content: "Subscriptions",
              },
              {
                value: "conflicts",
                content: "Conflicts",
              },
              {
                value: "events",
                content: "Events",
              },
            ]}
          >
            <Box>

              <ConsumerSubscriptionsTable addr={decodedLavaId} />

              <SortableTableInATabComponent
                columns={[
                  { key: "specId", name: "Spec" },
                  { key: "requestBlock", name: "Block" },
                  { key: "apiInterface", name: "Interface" },
                  { key: "connectionType", name: "Connection Type" },
                  { key: "requestData", name: "Request Data" },
                  { key: "apiURL", name: "Api URL" },
                ]}
                data={consumer.conflicts}
                defaultSortKey="requestBlock"
                tableAndTabName="conflicts"
                pkey="id"
                pkeyUrl="none"
                rowFormatters={{
                  specId: (data) => (
                    <Link className='orangelinks' href={`/spec/${data.specId}`}>{data.specId}</Link>
                  ),
                }}
              />
            </Box>

            <ConsumersEventsTab addr={decodedLavaId} />
          </JsinfoTabs>
        </Card>
      </LegacyTheme>
    </>
  );
}
