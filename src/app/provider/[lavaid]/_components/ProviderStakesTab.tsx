// src/app/provider/[lavaid]/_components/ProviderStakesTab.tsx

"use client";

import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import ChainWithIconLink from "@jsinfo/components/modern/ChainWithIconLink";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";

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
            pkeyUrl="none"
            rowFormatters={{
                specId: (data) => <ChainWithIconLink chainId={data.specId} className="orangelinks" />,
                totalStake: (data) => <LavaWithTooltip amount={data.totalStake} />,
                stake: (data) => <LavaWithTooltip amount={data.stake} />,
                delegateTotal: (data) => <LavaWithTooltip amount={data.delegateTotal} />,
                delegateCommission: (data) => {
                    const commission = data.delegateCommission;
                    return `${String(commission).trim()}%`;
                },
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