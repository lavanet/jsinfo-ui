// src/app/consumer/page.tsx
"use client";

import Link from 'next/link'
import { Card, Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/classic/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import { useEffect } from "react";
import { usePageContext } from '@jsinfo/context/PageContext';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import ConsumerChart from '@jsinfo/app/consumer/[lavaid]/_components/ConsumerChart';
import ConsumerSubscriptionsTable from './_components/ConsumerSubscriptionsTab';
import ConsumerEventsTab from './_components/ConsumerEventsTab';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, ArrowUpNarrowWide, CreditCard } from 'lucide-react';
import BackToConsumersLink from './_components/BackToConsumers';

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
      <BackToConsumersLink />

      <div style={{ marginLeft: '23px' }}>
        <h1 className="text-3xl font-bold mb-4">{consumer.addr}</h1>
      </div>

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

      {/* <ConsumerChart consumerId={decodedLa vaId} /> */}

      <div className="box-margin-div"></div>
      <div className="box-margin-div"></div>

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
                <Link className='orangelinks' href={`/chain/${data.specId}`}>{data.specId}</Link>
              ),
            }}
          />
        </Box>

        <ConsumerEventsTab addr={decodedLavaId} />
      </JsinfoTabs>
    </>
  );
}
