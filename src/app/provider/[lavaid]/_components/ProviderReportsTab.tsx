// src/app/provider/[lavaid]/_components/ProviderReportsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import { GetExplorersGuruUrl } from '@jsinfo/lib/env';

interface ProviderReportsTabProps {
    addr: string;
}

const ProviderReportsTab: React.FC<ProviderReportsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "provider_reported.blockId", name: "Block" },
                { key: "provider_reported.chainId", name: "Chain" },
                { key: "blocks.datetime", name: "Time" },
                { key: "provider_reported.cu", name: "CU" },
                {
                    key: "provider_reported.disconnections",
                    name: "Disconnections",
                },
                { key: "provider_reported.errors", name: "Errors" },
                { key: "provider_reported.project", name: "Project" },
            ]}
            tableDescription={
                <>
                    Jail reports are recorded on the chain following their submission.<br />
                    Disconnections indicate that the consumer was unable to establish a connection.<br />
                    For detailed information on errors, please refer to the Errors tab.
                </>
            }
            dataKey={`providerReports/${addr}`}
            defaultSortKey="provider_reported.id|desc"
            tableAndTabName="reports"
            pkey="provider_reported.provider,provider_reported.blockId"
            pkeyUrl="none"
            rowFormatters={{
                "provider_reported.chainId": (report) => (
                    <Link className='orangelinks'
                        href={`/chain/${report.provider_reported.chainId}`}
                    >
                        {report.provider_reported.chainId}
                    </Link>
                ),
                "provider_reported.blockId": (report) => (
                    <Link className='orangelinks'
                        href={
                            report.provider_reported.tx
                                ? `${GetExplorersGuruUrl()}/transaction/${report.provider_reported.tx}`
                                : `${GetExplorersGuruUrl()}/block/${report.provider_reported.blockId}`
                        }
                    >
                        {report.provider_reported.blockId}
                    </Link>
                ),
                "blocks.datetime": (report) =>
                    (<TimeTooltip datetime={report.blocks.datetime} />),
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerReportsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderReportsTab;