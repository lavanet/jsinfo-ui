// src/app/spec/[specid]/_components/SpecStakesTable.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import { RenderInFullPageCard } from '@jsinfo/lib/utils';
import { ErrorDisplay } from '@jsinfo/components/legacy/ErrorDisplay';
import MonikerAndProviderLink from '@jsinfo/components/legacy/MonikerAndProviderLink';
import LavaWithTooltip from "@jsinfo/components/legacy/LavaWithTooltip";

interface SpecStakesTableProps {
    specid: string
}

const SpecStakesTable: React.FC<SpecStakesTableProps> = ({ specid }) => {
    const { data, loading, error } = useApiFetch("specStakes/" + specid);

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