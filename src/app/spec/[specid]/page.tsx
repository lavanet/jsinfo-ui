// src/app/spec/[specid]/page.tsx
"use client";

import Link from 'next/link'
import { Flex, Card, Box } from "@radix-ui/themes";
import { useEffect } from "react";

import { useCachedFetch } from "@jsinfo/hooks/useCachedFetch";

import { DataKeySortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/common/convertors";
import { usePageContext } from "@jsinfo/context/PageContext";

import BlockWithDateCard from "@jsinfo/components/BlockWithDateCard";
import TitledCard from "@jsinfo/components/TitledCard";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import { FormatNumber, RenderInFullPageCard } from '@jsinfo/common/utils';
import StatusCall from '@jsinfo/components/StatusCell';
import CsvButton from '@jsinfo/components/CsvButton';
import SpecChart from '@jsinfo/charts/specChart';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';

export default function Spec({ params }: { params: { specid: string } }) {

  let decodedSpecId = decodeURIComponent(params.specid);

  const specIdPattern = /^[A-Za-z0-9]+$/; // Matches alphanumeric characters

  if (!specIdPattern.test(decodedSpecId)) {
    const error = 'Invalid spec format';
    return RenderInFullPageCard(<ErrorDisplay message={error} />);
  }

  const { data, loading, error } = useCachedFetch({
    dataKey: "spec",
    useLastUrlPathInKey: true,
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
              content: (
                <CsvButton
                  csvDownloadLink={`specStakesCsv/${specId}`}
                >
                  Stakes
                </CsvButton>
              ),
            },
          ]}
        >
          <Box>
            <DataKeySortableTableInATabComponent
              columns={[
                { key: "provider", name: "Provider" },
                { key: "status", name: "Status" },
                { key: "geolocation", name: "Geolocation" },
                { key: "addonsAndExtensions", name: "Addons&Extensions" },
                { key: "stake", name: "Stake" },
                { key: "cuSum", name: "90-Day CUs" },
                { key: "relaySum", name: "90-Day Relays" },
              ]}
              dataKey="specStakes"
              useLastUrlPathInKey={true}
              defaultSortKey="cuSum|desc"
              tableAndTabName="stakes"
              pkey="provider"
              pkeyUrl="none"
              rowFormatters={{
                provider: (data) => (
                  <Link href={`/provider/${data.provider}`}>
                    {data.provider
                      ? data.moniker
                      : data.provider}
                  </Link>
                ),
                status: (data) => <StatusCall status={StatusToString(data.status)} />,
                geolocation: (data) =>
                  GeoLocationToString(data.geolocation),
                stake: (data) =>
                  FormatNumber(data.stake),
                cuSum: (data) =>
                  FormatNumber(data.cuSum),
                relaySum: (data) =>
                  FormatNumber(data.relaySum),
              }}
            />
          </Box>
        </JsinfoTabs>
      </Card>
    </>
  );
}
