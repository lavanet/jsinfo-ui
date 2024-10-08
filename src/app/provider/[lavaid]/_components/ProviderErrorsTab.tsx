// src/app/provider/[lavaid]/_components/ProviderErrorsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

interface ProviderErrorsTabProps {
    addr: string;
}

const ProviderErrorsTab: React.FC<ProviderErrorsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "date", name: "Date" },
                { key: "spec", name: "Spec" },
                { key: "error", name: "Error" },
            ]}
            tableDescription={
                <>
                    Lava consumers sends real-time reports about provider communication to lava info.
                    <br />
                    These errors are the cause of jailing decisions and are here as a reference for improvements.
                    <br />
                    The errors reported are consecutive errors. These events are submitted later on-chain.
                </>
            }
            dataKey={`providerErrors/${addr}`}
            defaultSortKey="id|desc"
            tableAndTabName="errors"
            pkey="id"
            pkeyUrl="none"
            rowFormatters={{
                date: (data) => (<TimeTooltip datetime={data.date} />),
                spec: (data) => (
                    <ChainWithIconLink chainId={data.spec} className="orangelinks" />
                ),
                error: (data) => {
                    return (
                        <div
                            style={{
                                wordBreak: "break-all",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {data.error}
                        </div>
                    );
                },
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerErrorsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderErrorsTab;