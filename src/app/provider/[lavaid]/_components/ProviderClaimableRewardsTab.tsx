// src/app/provider/[lavaid]/_components/ProviderClaimableRewardsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import { FormatNumberWithString } from '@jsinfo/common/utils';

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
                    <Link href={`/spec/${data.chainId}`}>{data.chainId}</Link>
                ),
                amount: (data) => FormatNumberWithString(data.amount.toUpperCase()),
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`ProviderClaimableRewardsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderClaimableRewardsTab;