// src/app/spec/[specid]/_components/SpecStakesTable.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/StaticSortTable";
import { StatusToString, GeoLocationToString } from "@jsinfo/common/convertors";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import { FormatNumber, RenderInFullPageCard } from '@jsinfo/common/utils';
import StatusCall from '@jsinfo/components/StatusCell';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import SpecProviderEndpointHealthSummary from '@jsinfo/app/spec/[specid]/_components/SpecProviderEndpointHealthSummary';
import MonikerAndProviderLink from '@jsinfo/components/MonikerAndProviderLink';

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
                    { key: "totalStake", name: "Total Stake" },
                    { key: "stake", name: "Self Stake" },
                    { key: "delegateLimit", name: "Delegation Limit" },
                    { key: "delegateTotal", name: "Delegation Total" },
                    { key: "delegateCommission", name: "Delegate Commission" },
                ]}
                data={data.data}
                defaultSortKey="totalStake|desc"
                tableAndTabName="stakes"
                pkey="provider"
                pkeyUrl="none"
                rowFormatters={{
                    provider: (data) => (<MonikerAndProviderLink provider={data} />),
                    stake: (data) => FormatNumber(data.stake),
                    totalStake: (data) => FormatNumber(data.totalStake),
                    delegateLimit: (data) => FormatNumber(data.delegateLimit),
                    delegateTotal: (data) => FormatNumber(data.delegateTotal),
                    delegateCommission: (data) => FormatNumber(data.delegateCommission),
                }}
            />
        </Box>
    );
};

export default SpecStakesTable;