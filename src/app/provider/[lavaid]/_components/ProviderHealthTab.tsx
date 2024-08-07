// src/app/provider/[lavaid]/_components/ProviderHealthTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import StatusCall from '@jsinfo/components/StatusCell';

interface ProviderHealthTabProps {
    addr: string;
}

const ProviderHealthTab: React.FC<ProviderHealthTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "timestamp", name: "Time" },
                { key: "spec", name: "Spec" },
                { key: "interface", name: "Interface" },
                { key: "status", name: "Status" },
                { key: "region", name: "Region" },
                { key: "message", name: "Message" },
            ]}
            tableDescription="Lava is running a health probe against all providers periodically from 2 regions - US and EU"
            dataKey={`providerHealth/${addr}`}
            defaultSortKey="timestamp|desc"
            tableAndTabName="health"
            pkey="id"
            pkeyUrl="none"
            rowFormatters={{
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                spec: (data) => (
                    <Link href={`/spec/${data.spec}`}>{data.spec}</Link>
                ),
                status: (data) => <StatusCall status={data.status} />,
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerHealthCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderHealthTab;