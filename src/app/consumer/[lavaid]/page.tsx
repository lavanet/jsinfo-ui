// src/app/consumer/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import TitledCard from "@jsinfo/components/legacy/TitledCard";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import { useEffect } from "react";
import { usePageContext } from '@jsinfo/context/PageContext';
import { ErrorDisplay } from '@jsinfo/components/legacy/ErrorDisplay';
import { RenderInFullPageCard } from '@jsinfo/lib/utils';
import ConsumerChart from '@jsinfo/components/charts/ConsumerChart';
import ConsumerSubscriptionsTable from './_components/ConsumersSubscriptionsTab';
import ConsumersEventsTab from './_components/ConsumersEventsTab';

export default function Consumer({ params }: { params: { lavaid: string } }) {

  let decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return RenderInFullPageCard(<ErrorDisplay message={error} />);
  }

  const { data, loading, error } = useApiFetch('consumer/' + decodedLavaId);

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('consumer/' + decodedLavaId);
    }
  }, [loading, error, decodedLavaId, setCurrentPage]);

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${decodedLavaId} consumer page`} greyText={`${decodedLavaId} consumer`} />);

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

      <div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3">
          <TitledCard
            title="Cu Sum"
            value={consumer.cuSum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Relay Sum"
            value={consumer.relaySum}
            className="col-span-1"
            formatNumber={true}
          />
          <TitledCard
            title="Pay Sum"
            value={consumer.rewardSum}
            className="col-span-2 md:col-span-1"
            formatNumber={true}
          />
        </Flex>
      </div>

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
    </>
  );
}
