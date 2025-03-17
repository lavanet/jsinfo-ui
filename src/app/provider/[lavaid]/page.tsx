// src/app/provider/[lavaid]/page.tsx
"use client";

import { useEffect } from "react";
import { Box } from "@radix-ui/themes";
import { usePageContext } from "@jsinfo/context/PageContext";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';

import { MonikerAndProviderAddressCardWithFetch } from './_components/MonikerAndProviderAddressCard';
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";

import ProviderChart from '@jsinfo/app/provider/[lavaid]/_components/ProviderChart';
import ProviderHealthTab from './_components/ProviderHealthTab';
import ProviderErrorsTab from './_components/ProviderErrorsTab';
import ProviderEventsTab from './_components/ProviderEventsTab';
// import ProviderAttributesTab from './_components/ProviderAttributesTab';
import ProviderRewardsTab from './_components/ProviderRewardsTab';
import ProviderReportsTab from './_components/ProviderReportsTab';
import ProviderBlockReportsTab from './_components/ProviderBlockReportsTab';
import ProviderCards from "./_components/ProviderCards";
import BackToProvidersLink from "./_components/BackToProviders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jsinfo/components/shadcn/ui/Card";
import ProviderHealthTable from "@jsinfo/app/provider/[lavaid]/_components/ProviderLatestHealthTable";
import { ProviderPerSpecRelaysPieChart } from "./_components/ProviderPerSpecRelaysPieChart";
import ProviderLiveRequestFeed from "./_components/ProviderLiveRequestFeed";
import VerifyComponent from '@jsinfo/app/components/VerifyComponent';
import ProviderConsumerOptimizerMetricsChart from "./_components/ProviderOptimzerMetricsChart";
import ProviderStakesV2 from "./_components/ProviderStakesV2";
import { GetJsinfobeUrl } from "@jsinfo/lib/env";
// import ProviderStakesTab from "./_components/ProviderStakesTab";

export default function ProviderPage({ params }: { params: { lavaid: string } }) {
  const decodedLavaId = decodeURIComponent(params.lavaid);

  const lavaIdPattern = /^lava@[a-z0-9]+$/;

  if (!lavaIdPattern.test(decodedLavaId)) {
    const error = 'Invalid lavaId format';
    return <ErrorDisplay message={error} />;
  }

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('provider/' + decodedLavaId);
  }, [decodedLavaId, setCurrentPage]);

  const { hasNoData, component: monikerComponent } = MonikerAndProviderAddressCardWithFetch({ lavaId: decodedLavaId });

  if (hasNoData) {
    return (
      <div className="container mx-auto p-4">
        <BackToProvidersLink />
        <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
        <p>No data available for provider with Lava ID: {decodedLavaId}</p>
      </div>
    );
  }

  return (
    <>
      <BackToProvidersLink />

      <div style={{ marginBottom: '5px' }}></div>

      {monikerComponent}

      <VerifyComponent keyName="Provider Components Grid">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4">
          <VerifyComponent keyName="Provider Pie Chart">
            <div className="provider-pie-chart-grid" style={{ width: '350px', height: '390px' }}>
              <ProviderPerSpecRelaysPieChart lavaId={decodedLavaId} />
            </div>
          </VerifyComponent>
          <VerifyComponent keyName="Provider Cards">
            <div>
              <ProviderCards addr={decodedLavaId} />
            </div>
          </VerifyComponent>
        </div>
      </VerifyComponent>

      <VerifyComponent keyName="Provider Optimizer Metrics Chart">
        <ProviderConsumerOptimizerMetricsChart providerId={decodedLavaId} />
      </VerifyComponent>

      <div style={{ marginBottom: '20px' }}></div>

      <VerifyComponent keyName="Provider Chart">
        <div className="many-legend-chart" style={{ marginTop: '-10px', marginBottom: '-10px' }}>
          <ProviderChart providerId={decodedLavaId} />
        </div>
      </VerifyComponent>

      <div style={{ marginBottom: '30px' }}></div>

      <VerifyComponent keyName="Provider Health Table">
        <ProviderHealthTable providerId={decodedLavaId} />
      </VerifyComponent>

      <div style={{ marginBottom: '20px' }}></div>

      <VerifyComponent keyName="Provider Live Request Feed">
        <ProviderLiveRequestFeed lavaid={decodedLavaId} />
      </VerifyComponent>

      <div style={{ marginBottom: '20px' }}></div>

      <VerifyComponent keyName="Provider Stakes V2">
        <Box>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>Stakes</span>
                </div>
                <a
                  href={`${GetJsinfobeUrl().endsWith('/') ? GetJsinfobeUrl().slice(0, -1) : GetJsinfobeUrl()}/providerStakesV2Csv/${decodedLavaId}`}
                  download={`${decodedLavaId}-stakes.csv`}
                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-md transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CSV
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderStakesV2 providerId={decodedLavaId} />
            </CardContent>
          </Card>
        </Box>
      </VerifyComponent>

      <div style={{ marginBottom: '5px' }}></div>

      <VerifyComponent keyName="Card Header">
        <CardHeader>
          <CardTitle>Full Provider Details</CardTitle>
          <CardDescription>Comprehensive information about the provider's performance and metrics</CardDescription>
        </CardHeader>
      </VerifyComponent>

      <div style={{ marginBottom: '5px' }}></div>

      <VerifyComponent keyName="Jsinfo Tabs">
        <JsinfoTabs defaultValue="health"
          tabs={[
            // { value: "health", content: "Health History" },
            { value: "errors", content: "Errors" },
            // { value: "attributes", content: "Attributes" },
            // { value: "stakes", content: "Stakes" },
            // { value: "events", content: "Events" },
            // { value: "rewards", content: "Rewards" },
            { value: "reports", content: "Reports" },
            { value: "blockReports", content: "Block Reports" },
          ]}
        >
          <Box>
            {/* <VerifyComponent keyName="Provider Health Tab">
              <ProviderHealthTab addr={decodedLavaId} />
            </VerifyComponent> */}
            <VerifyComponent keyName="Provider Errors Tab">
              <ProviderErrorsTab addr={decodedLavaId} />
            </VerifyComponent>
            {/* <VerifyComponent keyName="Provider Events Tab">
              <ProviderEventsTab addr={decodedLavaId} />
            </VerifyComponent> */}
            {/* <VerifyComponent keyName="Provider Attributes Tab">
              <ProviderAttributesTab addr={decodedLavaId} />
            </VerifyComponent>
            <VerifyComponent keyName="Provider Stakes Tab">
              <ProviderStakesTab addr={decodedLavaId} />
            </VerifyComponent> */}
            {/* <VerifyComponent keyName="Provider Rewards Tab">
              <ProviderRewardsTab addr={decodedLavaId} />
            </VerifyComponent> */}
            <VerifyComponent keyName="Provider Reports Tab">
              <ProviderReportsTab addr={decodedLavaId} />
            </VerifyComponent>
            <VerifyComponent keyName="Provider Block Reports Tab">
              <ProviderBlockReportsTab addr={decodedLavaId} />
            </VerifyComponent>
          </Box>
        </JsinfoTabs>
      </VerifyComponent>
    </>
  );
}
