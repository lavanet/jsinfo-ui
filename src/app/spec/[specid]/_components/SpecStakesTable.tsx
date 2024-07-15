// src/app/spec/[specid]/page.tsx
"use client";

import Link from 'next/link'
import { Box } from "@radix-ui/themes";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/SortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/common/convertors";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import { FormatNumber, IsMeaningfulText, RenderInFullPageCard } from '@jsinfo/common/utils';
import StatusCall from '@jsinfo/components/StatusCell';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import SpecProviderEndpointHealthSummary from '@jsinfo/app/spec/[specid]/_components/SpecProviderEndpointHealthSummary';

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
                    { key: "status", name: "Node&Endpoints Status" },
                    { key: "geolocation", name: "Geolocation" },
                    { key: "stake", name: "Stake" },
                    { key: "cuSum30Days", name: "30-Day CUs" },
                    { key: "relaySum30Days", name: "30-Day Relays" },
                    { key: "cuSum90Days", name: "90-Day CUs" },
                    { key: "relaySum90Days", name: "90-Day Relays" },
                    { key: "addonsAndExtensions", name: "Addons&Extensions" },
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
                    status: (data) => (
                        <div style={{ whiteSpace: 'nowrap' }}>
                            <StatusCall status={StatusToString(data.status)} />
                            {data.provider && <SpecProviderEndpointHealthSummary provider={data.provider} spec={specid} />}
                        </div>
                    ),
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

export default SpecStakesTable;