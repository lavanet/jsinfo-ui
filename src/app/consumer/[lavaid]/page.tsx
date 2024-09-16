// src/app/consumer/page.tsx
"use client";

import Link from 'next/link'
import { Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import { useEffect } from "react";
import { usePageContext } from '@jsinfo/context/PageContext';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import ConsumerChart from '@jsinfo/app/consumer/[lavaid]/_components/ConsumerChart';
import ConsumerSubscriptionsTable from './_components/ConsumerSubscriptionsTab';
import ConsumerEventsTab from './_components/ConsumerEventsTab';
import BackToConsumersLink from './_components/BackToConsumers';
import ConsumerCards from './_components/ConsumerCards';
import ConsumerConflictsTable from './_components/consumerConflictsTab';

export default function Consumer({ params }: { params: { lavaid: string } }) {

  const decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return <ErrorDisplay message={error} />;
  }

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('consumer/' + decodedLavaId);
  }, [decodedLavaId, setCurrentPage]);

  return (
    <>
      <BackToConsumersLink />

      <div style={{ marginLeft: '23px' }}>
        <h1 className="text-3xl font-bold mb-4">{decodedLavaId}</h1>
      </div>

      <div style={{ marginTop: '25px' }}></div>
      <ConsumerCards lavaid={decodedLavaId} />
      <div style={{ marginTop: '25px' }}></div>

      {/* <ConsumerChart consumerId={decoded La vaId} /> */}

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
          <ConsumerConflictsTable lavaid={decodedLavaId} />
          <ConsumerEventsTab addr={decodedLavaId} />
        </Box>
      </JsinfoTabs>
    </>
  );
}
