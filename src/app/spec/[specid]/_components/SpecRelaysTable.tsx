// src/app/spec/[specid]/_components/SpecRelaysTable.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/lib/convertors";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import { RenderInFullPageCard } from '@jsinfo/lib/utils';
import { FormatNumber } from '@jsinfo/lib/formatting';
import StatusCall from '@jsinfo/components/legacy/StatusCell';
import { ErrorDisplay } from '@jsinfo/components/legacy/ErrorDisplay';
import SpecProviderEndpointHealthSummary from '@jsinfo/app/spec/[specid]/_components/SpecProviderEndpointHealthSummary';
import MonikerAndProviderLink from '@jsinfo/components/modern/MonikerAndProviderLink';

interface SpecRelaysTableProps {
    specid: string
}

const SpecRelaysTable: React.FC<SpecRelaysTableProps> = ({ specid }) => {
    const { data, loading, error } = useApiFetch("specStakes/" + specid);

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${specid} stake data`} greyText={`${specid} stake`} />);

    return (
        <Box>
            <SortableTableInATabComponent
                columns={[
                    { key: "provider", name: "Provider" },
                    { key: "status", name: "Node&Endpoints Status" },
                    { key: "geolocation", name: "Geolocation" },
                    { key: "cuSum30Days", name: "30-Day CUs" },
                    { key: "relaySum30Days", name: "30-Day Relays" },
                    { key: "cuSum90Days", name: "90-Day CUs" },
                    { key: "relaySum90Days", name: "90-Day Relays" },
                    { key: "addons", name: "Addons" },
                    { key: "extensions", name: "Extensions" },
                ]}
                data={data.data}
                defaultSortKey="cuSum90Days|desc"
                tableAndTabName="relays"
                pkey="provider"
                pkeyUrl="none"
                rowFormatters={{
                    provider: (data) => (<MonikerAndProviderLink provider={data} />),
                    status: (data) => (
                        <div style={{ whiteSpace: 'nowrap' }}>
                            <StatusCall status={StatusToString(data.status)} />
                            {data.provider && <SpecProviderEndpointHealthSummary provider={data.provider} spec={specid} />}
                        </div>
                    ),
                    geolocation: (data) => GeoLocationToString(data.geolocation),
                    cuSum30Days: (data) => FormatNumber(data.cuSum30Days),
                    relaySum30Days: (data) => FormatNumber(data.relaySum30Days),
                    cuSum90Days: (data) => FormatNumber(data.cuSum90Days),
                    relaySum90Days: (data) => FormatNumber(data.relaySum90Days),
                }}
            />
        </Box>
    );
};

export default SpecRelaysTable;