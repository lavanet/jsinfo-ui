// src/app/provider/[lavaid]/page.tsx
"use client";

import { useEffect } from "react";

import { Flex, Card, Box } from "@radix-ui/themes";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { usePageContext } from "@jsinfo/context/PageContext";

import { RenderInFullPageCard } from '@jsinfo/common/utils';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';

import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import MonikerAndProviderAddressCard from "@jsinfo/components/MonikerAndProviderAddressCard";
import TitledCard from "@jsinfo/components/TitledCard";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";

import ProviderChart from '@jsinfo/charts/providerChart';

import ProviderLatestHealthCards from '@jsinfo/app/provider/[lavaid]/_components/ProviderLatestHealth';

import ProviderHealthTab from './_components/ProviderHealthTab';
import ProviderErrorsTab from './_components/ProviderErrorsTab';
import ProviderEventsTab from './_components/ProviderEventsTab';
import ProviderAttributesTab from './_components/ProviderAttributesTab';
import ProviderStakesTab from './_components/ProviderStakesTab';
import ProviderRewardsTab from './_components/ProviderRewardsTab';
import ProviderReportsTab from './_components/ProviderReportsTab';
import ProviderBlockReportsTab from './_components/ProviderBlockReportsTab';
import ProviderAccountInfoTab from './_components/ProviderAccountInfoTab';
import ProviderClaimableRewardsTab from "./_components/ProviderClaimableRewardsTab";

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
      <MonikerAndProviderAddressCard provider={provider} />
      <div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
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
      </div>

      <ProviderChart addr={decodedLavaId} />
      <div className="box-margin-div"></div>

      <ProviderLatestHealthCards lavaId={decodedLavaId} />
      <div className="box-margin-div"></div>

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
              value: "attributes",
              content: "Attributes",
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
            {
              value: "accountInfo",
              content: "Account Info",
            },
          ]}
        >
          <Box>

            <ProviderHealthTab addr={decodedLavaId} />
            <ProviderErrorsTab addr={decodedLavaId} />
            <ProviderEventsTab addr={decodedLavaId} />
            <ProviderAttributesTab addr={decodedLavaId} />
            <ProviderStakesTab addr={decodedLavaId} />
            <ProviderRewardsTab addr={decodedLavaId} />
            <ProviderReportsTab addr={decodedLavaId} />
            <ProviderBlockReportsTab addr={decodedLavaId} />
            <ProviderClaimableRewardsTab addr={decodedLavaId} />
            <ProviderAccountInfoTab addr={decodedLavaId} />

          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
