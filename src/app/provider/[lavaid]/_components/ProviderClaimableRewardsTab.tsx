// src/app/provider/[lavaid]/_components/ProviderClaimableRewardsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import LavaWithTooltip from '@jsinfo/components/modern/LavaWithTooltip';
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

interface ProviderClaimableRewardsTabProps {
    addr: string;
}

const ProviderClaimableRewardsTab: React.FC<ProviderClaimableRewardsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "timestamp", name: "Time" },
                { key: "chainId", name: "Spec" },
                { key: "amount", name: "Amount" },
            ]}
            tableDescription={
                <>
                    The rewards that the provider can claim.
                </>
            }
            dataKey={`providerDelegatorRewards/${addr}`}
            defaultSortKey="id|desc"
            tableAndTabName="claimableProviderRewards"
            pkey="id"
            pkeyUrl="none"
            rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                chainId: (data) => (
                    <ChainWithIconLink chainId={data.chainId} className="orangelinks" />
                ),
                amount: (data) => <LavaWithTooltip amount={data.amount} />,
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerDelegatorRewardsCsv/${addr}`}
                />
            )}
        />

    );
};

export default ProviderClaimableRewardsTab;