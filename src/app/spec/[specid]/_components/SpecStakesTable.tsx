// src/app/spec/[specid]/_components/SpecStakesTable.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import { RenderInFullPageCard } from '@jsinfo/common/utils';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import MonikerAndProviderLink from '@jsinfo/components/MonikerAndProviderLink';
import LavaWithTooltip from "@jsinfo/components/LavaWithTooltip";

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
                    totalStake: (data) => <LavaWithTooltip amount={data.totalStake} />,
                    stake: (data) => <LavaWithTooltip amount={data.stake} />,
                    delegateLimit: (data) => <LavaWithTooltip amount={data.delegateLimit} />,
                    delegateTotal: (data) => <LavaWithTooltip amount={data.delegateTotal} />,
                    delegateCommission: (data) => <LavaWithTooltip amount={data.delegateCommission} />,
                }}
            />
        </Box>
    );
};

export default SpecStakesTable;