// src/app/chain/[specid]/page.tsx
"use client";

import { Card, Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import StatCard from "@jsinfo/components/sections/StatCard";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import SpecChart from '@jsinfo/app/chain/[specid]/_components/SpecChart';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import SpecEndpointHealthSummary from '@jsinfo/app/chain/[specid]/_components/SpecEndpointHealthSummary';
import SpecStakesTable from '@jsinfo/app/chain/[specid]/_components/SpecStakesTable';
import SpecRelaysTable from "./_components/SpecRelaysTable";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { ArrowUpNarrowWide, CreditCard, DatabaseZap, MonitorCog, SquareActivity } from "lucide-react";
import LegacyTheme from "@jsinfo/components/classic/LegacyTheme";

export default function Spec({ params }: { params: { specid: string } }) {

  let decodedSpecId = decodeURIComponent(params.specid);

  const specIdPattern = /^[A-Za-z0-9]+$/;

  if (!specIdPattern.test(decodedSpecId)) {
    const error = 'Invalid spec format';
    return <ErrorDisplay message={error} />;
  }

  const { data, loading, error } = useApiFetch("spec/" + decodedSpecId);

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('spec/' + decodedSpecId);
    }
  }, [loading, error, decodedSpecId, setCurrentPage]);

  const specId = decodedSpecId;

  if (error) return <ErrorDisplay message={error} />;
  if (loading) return <LoadingIndicator loadingText={`Loading ${specId} spec page`} greyText={`${specId} spec`} />;

  return (
    <>
      <div style={{ marginTop: '5px' }}></div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Spec"
          value={data.specId}
          className="col-span-1"
        />
        <StatCard
          title="Providers"
          value={data.providerCount}
          className="col-span-1"
        />
        <StatCard
          title="Total CU"
          value={data.cuSum}
          className="col-span-1"
          formatNumber={true}
          tooltip={`Total compute units for ${data.specId} by all providers`}
          icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Relays"
          value={data.relaySum}
          className="col-span-1"
          formatNumber={true}
          tooltip={`Total relays for ${data.specId} by all providers`}
          icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Rewards"
          value={<LavaWithTooltip amount={data.rewardSum} />}
          className="col-span-1 md:col-span-1"
          formatNumber={false}
          tooltip={`Total rewards for ${data.specId} by all providers`}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Endpoint Status"
          value={(<SpecEndpointHealthSummary healthy={(data?.endpointHealth?.healthy || 0)} unhealthy={(data?.endpointHealth?.unhealthy || 0)} />)}
          className="col-span-1 md:col-span-1"
          formatNumber={false}
          tooltip={`Total rewards for ${data.specId} by all providers`}
          icon={<SquareActivity className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Cache hit/total (30 days)"
          value={data.cacheHitRate ? `${data.cacheHitRate} %` : "0"}
          className="col-span-1 md:col-span-1"
          formatNumber={false}
          tooltip={`Cache hit/total for ${data.specId} in the last 30 days`}
          icon={<DatabaseZap className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div style={{ marginTop: '30px' }}></div>

      <SpecChart spec={specId} />
      <div className="box-margin-div"></div>

      <LegacyTheme>
        <JsinfoTabs defaultValue="relays"
          tabs={[
            {
              value: "relays",
              content: "Provider Relays",
            },
            {
              value: "stakes",
              content: "Provider Stakes",
            },
          ]}
        >
          <Box>
            <SpecRelaysTable specid={specId} />
          </Box>
          <Box>
            <SpecStakesTable specid={specId} />
          </Box>
        </JsinfoTabs>
      </LegacyTheme>
    </>
  );
}
