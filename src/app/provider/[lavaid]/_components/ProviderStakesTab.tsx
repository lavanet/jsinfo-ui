// src/app/provider/[lavaid]/_components/ProviderStakesTab.tsx

"use client";

import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import { FormatNumber } from '@jsinfo/common/utils';

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
                totalStake: (data) => FormatNumber(data.totalStake),
                stake: (data) => FormatNumber(data.stake),
                delegateLimit: (data) => FormatNumber(data.delegateLimit),
                delegateTotal: (data) => FormatNumber(data.delegateTotal),
                delegateCommission: (data) => FormatNumber(data.delegateCommission),
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