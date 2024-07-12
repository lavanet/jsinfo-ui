// src/app/spec/[specid]/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Card, Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/common/convertors";
import { usePageContext } from "@jsinfo/context/PageContext";
import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import TitledCard from "@jsinfo/components/TitledCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import { FormatNumber, IsMeaningfulText, RenderInFullPageCard } from '@jsinfo/common/utils';
import StatusCall from '@jsinfo/components/StatusCell';
import SpecChart from '@jsinfo/charts/specChart';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';

interface SpecStakesTableProps {
  specid: string
}

const SpecStakesTable: React.FC<SpecStakesTableProps> = ({ specid }) => {
  const { data, loading, error } = useApiDataFetch({
    dataKey: "specStakes/" + specid,
  });

  if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
  if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${specid} stake data`} greyText={`${specid} stake`} />);

  return (
    <Box>
      <SortableTableInATabComponent
        columns={[
          { key: "provider", name: "Provider" },
          { key: "status", name: "Status" },
          { key: "geolocation", name: "Geolocation" },
          { key: "addonsAndExtensions", name: "Addons&Extensions" },
          { key: "stake", name: "Stake" },
          { key: "cuSum30Days", name: "30-Day CUs" },
          { key: "relaySum30Days", name: "30-Day Relays" },
          { key: "cuSum90Days", name: "90-Day CUs" },
          { key: "relaySum90Days", name: "90-Day Relays" },
        ]}
        data={data.data}
        defaultSortKey="cuSum90Days|desc"
        tableAndTabName="stakes"
        pkey="provider"
        pkeyUrl="none"
        rowFormatters={{
          provider: (data) => (
            <Link href={`/provider/${data.provider}`}>
              {IsMeaningfulText(data.moniker) ? data.moniker : data.provider}
            </Link>
          ),
          status: (data) => <StatusCall status={StatusToString(data.status)} />,
          geolocation: (data) => GeoLocationToString(data.geolocation),
          stake: (data) => FormatNumber(data.stake),
          cuSum30Days: (data) => FormatNumber(data.cuSum30Days),
          relaySum30Days: (data) => FormatNumber(data.relaySum30Days),
          cuSum90Days: (data) => FormatNumber(data.cuSum90Days),
          relaySum90Days: (data) => FormatNumber(data.relaySum90Days),
        }}
      />
    </Box>
  );
};


export default function Spec({ params }: { params: { specid: string } }) {

  let decodedSpecId = decodeURIComponent(params.specid);

  const specIdPattern = /^[A-Za-z0-9]+$/;

  if (!specIdPattern.test(decodedSpecId)) {
    const error = 'Invalid spec format';
    return RenderInFullPageCard(<ErrorDisplay message={error} />);
  }

  const { data, loading, error } = useApiDataFetch({
    dataKey: "spec/" + specid,
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
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-5">
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
            className="col-span-2 md:col-span-1"
            formatNumber={true}
            tooltip="Total rewards for this spec by all providers"
          />
        </Flex>
      </Card>

      <SpecChart specid={specId} />

      <Card>
        <JsinfoTabs defaultValue="stakes"
          tabs={[
            {
              value: "stakes",
              content: "Stakes",
            },
          ]}
        >
          <Box>
            <SpecStakesTable specid={specId} />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
