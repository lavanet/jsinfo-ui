// src/app/provider/[lavaid]/page.tsx
"use client";

import { useEffect } from "react";

import { Box } from "@radix-ui/themes";
import { usePageContext } from "@jsinfo/context/PageContext";

import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';

import { MonikerAndProviderAddressCardWithFetch } from "@jsinfo/components/modern/MonikerAndProviderAddressCard";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";

import ProviderChart from '@jsinfo/app/provider/[lavaid]/_components/ProviderChart';
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
import ProviderCards from "./_components/ProviderCards";
import BackToProvidersLink from "./_components/BackToProviders";
import { CardDescription, CardHeader, CardTitle } from "@jsinfo/components/shadcn/ui/Card";
import ProviderHealthTable from "@jsinfo/app/provider/[lavaid]/_components/ProviderLatestHealthTable";
import { ProviderPerSpecRelaysPieChart } from "./_components/ProviderPerSpecRelaysPieChart";
import ProviderLiveRequestFeed from "./_components/ProviderLiveRequestFeed";

export default function Provider({ params }: { params: { lavaid: string } }) {

  let decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return <ErrorDisplay message={error} />;
  }

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('provider/' + decodedLavaId);
  }, [decodedLavaId, setCurrentPage]);

  return (
    <>
      <BackToProvidersLink />



      <div style={{ marginBottom: '5px' }}></div>

      <MonikerAndProviderAddressCardWithFetch lavaId={decodedLavaId} />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4">
        <div className="provider-pie-chart-grid" style={{ width: '350px', height: '390px' }}>
          <ProviderPerSpecRelaysPieChart lavaId={decodedLavaId} />
        </div>
        <div>

          <ProviderCards addr={decodedLavaId} />

        </div>

      </div>

      <div className="many-legend-chart" style={{ marginTop: '-10px', marginBottom: '-10px' }}>
        <ProviderChart providerId={decodedLavaId} />
      </div>

      <div style={{ marginBottom: '30px' }}></div>

      <ProviderHealthTable providerId={decodedLavaId} />

      <div style={{ marginBottom: '20px' }}></div>

      <ProviderLiveRequestFeed lavaid={decodedLavaId} />

      <div style={{ marginBottom: '20px' }}></div>

      <CardHeader>
        <CardTitle>Full Provider Details</CardTitle>
        <CardDescription>Comprehensive information about the provider's performance and metrics</CardDescription>
      </CardHeader>


      <div className="box-margin-div"></div>

      <JsinfoTabs defaultValue="health"
        tabs={[
          {
            value: "health",
            content: "Health History",
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

    </>
  );
}
