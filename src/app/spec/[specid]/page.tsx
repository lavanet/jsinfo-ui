// src/app/spec/[specid]/page.tsx
"use client";

import { Flex, Card, Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import TitledCard from "@jsinfo/components/TitledCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import { RenderInFullPageCard } from '@jsinfo/common/utils';
import SpecChart from '@jsinfo/charts/specChart';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import SpecEndpointHealthSummary from '@jsinfo/app/spec/[specid]/_components/SpecEndpointHealthSummary';
import SpecStakesTable from '@jsinfo/app/spec/[specid]/_components/SpecStakesTable';
import SpecRelaysTable from "./_components/SpecRelaysTable";

export default function Spec({ params }: { params: { specid: string } }) {

  let decodedSpecId = decodeURIComponent(params.specid);

  const specIdPattern = /^[A-Za-z0-9]+$/;

  if (!specIdPattern.test(decodedSpecId)) {
    const error = 'Invalid spec format';
    return RenderInFullPageCard(<ErrorDisplay message={error} />);
  }

  const { data, loading, error } = useApiDataFetch({
    dataKey: "spec/" + decodedSpecId,
  });

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    if (!loading && !error) {
      setCurrentPage('spec/' + decodedSpecId);
    }
  }, [loading, error, decodedSpecId, setCurrentPage]);

  const specId = decodedSpecId;

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${specId} spec page`} greyText={`${specId} spec`} />);

  return (
    <>
      <BlockWithDateCard blockData={data} />
      <Card>
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-6">
          <TitledCard
            title="Spec"
            value={data.specId}
            className="col-span-1"
          />
          <TitledCard
            title="Providers"
            value={data.providerCount}
            className="col-span-1"
          />
          <TitledCard
            title="Total CU"
            value={data.cuSum}
            className="col-span-1"
            formatNumber={true}
            tooltip="Total compute units for this spec by all providers"
          />
          <TitledCard
            title="Total Relays"
            value={data.relaySum}
            className="col-span-1"
            formatNumber={true}
            tooltip="Total relays for this spec by all providers"
          />
          <TitledCard
            title="Total Rewards"
            value={`${data.rewardSum} ULAVA`}
            className="col-span-1 md:col-span-1"
            formatNumber={true}
            tooltip="Total rewards for this spec by all providers"
          />
          <TitledCard
            title="Endpoint Status"
            value={(<SpecEndpointHealthSummary healthy={(data?.endpointHealth?.healthy || 0)} unhealthy={(data?.endpointHealth?.unhealthy || 0)} />)}
            className="col-span-1 md:col-span-1"
            formatNumber={true}
            tooltip="Total rewards for this spec by all providers"
          />

        </Flex>
      </Card>

      <SpecChart specid={specId} />

      <Card>
        <JsinfoTabs defaultValue="relays"
          tabs={[
            {
              value: "relays",
              content: "Relays",
            },
            {
              value: "stakes",
              content: "Stakes",
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
      </Card>
    </>
  );
}
