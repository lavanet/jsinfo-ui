// src/app/chain/[specid]/_components/SpecStakesTable.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/classic/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import MonikerAndProviderLink from '@jsinfo/components/modern/MonikerAndProviderLink';
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";

interface SpecStakesTableProps {
    specid: string
}

const SpecStakesTable: React.FC<SpecStakesTableProps> = ({ specid }) => {
    const { data, isLoading, error } = useJsinfobeFetch("specStakes/" + specid);

    if (error) return <ErrorDisplay message={error} />;
    if (isLoading) return <LoadingIndicator loadingText={`Loading ${specid} stake data`} greyText={`${specid} stake`} />;

    return (
        <Box>
            <SortableTableInATabComponent
                columns={[
                    { key: "provider", name: "Provider" },
                    { key: "totalStake", name: "Total Stake" },
                    { key: "stake", name: "Self Stake" },
                    // { key: "delegateLimit", name: "Delegation Limit" },
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
                    // delegateLimit: (data) => <LavaWithTooltip amount={data.delegateLimit} />,
                    delegateTotal: (data) => <LavaWithTooltip amount={data.delegateTotal} />,
                    delegateCommission: (data) => {
                        const commission = data.delegateCommission;
                        const formattedCommission = `${String(commission).trim()}%`;
                        return <LavaWithTooltip amount={formattedCommission} />;
                    },
                }}
            />
        </Box>
    );
};

export default SpecStakesTable;