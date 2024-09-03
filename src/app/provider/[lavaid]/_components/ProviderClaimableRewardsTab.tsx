// src/app/provider/[lavaid]/_components/ProviderClaimableRewardsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/legacy/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/legacy/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import LavaWithTooltip from '@jsinfo/components/modern/LavaWithTooltip';

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
                    <Link className='orangelinks' href={`/spec/${data.chainId}`}>{data.chainId}</Link>
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