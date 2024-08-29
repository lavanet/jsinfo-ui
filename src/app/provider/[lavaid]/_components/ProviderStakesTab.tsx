// src/app/provider/[lavaid]/_components/ProviderStakesTab.tsx

"use client";

import { DataKeySortableTableInATabComponent } from "@jsinfo/components/legacy/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/legacy/TableCsvButton";
import LavaWithTooltip from "@jsinfo/components/legacy/LavaWithTooltip";

interface ProviderStakesTabProps {
    addr: string;
}

const ProviderStakesTab: React.FC<ProviderStakesTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "specId", name: "Spec" },
                { key: "totalStake", name: "Total Stake" },
                { key: "stake", name: "Self Stake" },
                { key: "delegateLimit", name: "Delegation Limit" },
                { key: "delegateTotal", name: "Delegation Total" },
                { key: "delegateCommission", name: "Delegate Commission" },
            ]}
            tableDescription={
                <>
                    Stakes per chain for the current provider
                </>
            }
            dataKey={`providerStakes/${addr}`}
            defaultSortKey="specId"
            tableAndTabName="stakes"
            pkey="specId"
            pkeyUrl="spec"

            rowFormatters={{
                totalStake: (data) => <LavaWithTooltip amount={data.totalStake} />,
                stake: (data) => <LavaWithTooltip amount={data.stake} />,
                delegateLimit: (data) => <LavaWithTooltip amount={data.delegateLimit} />,
                delegateTotal: (data) => <LavaWithTooltip amount={data.delegateTotal} />,
                delegateCommission: (data) => <LavaWithTooltip amount={data.delegateCommission} />,
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerStakesCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderStakesTab;