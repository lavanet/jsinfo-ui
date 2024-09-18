// src/app/provider/[lavaid]/_components/ProviderBlockReportsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import { FormatNumberWithString } from '@jsinfo/lib/formatting';
import { GetExplorersGuruUrl } from '@jsinfo/lib/env';
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

interface ProviderBlockReportsTabProps {
    addr: string;
}

const ProviderBlockReportsTab: React.FC<ProviderBlockReportsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "blockId", name: "Block" },
                { key: "timestamp", name: "Time" },
                { key: "chainId", name: "Chain" },
                { key: "chainBlockHeight", name: "Chain Block Height" },
            ]}
            tableDescription={
                <>
                    The chains (cookbook specs) supported by this provider in thier latest blocks
                </>
            }
            dataKey={`providerBlockReports/${addr}`}
            defaultSortKey="id|desc"
            tableAndTabName="blockReports"
            pkey="id"
            pkeyUrl="none"
            rowFormatters={{
                "blockId": (data) => (
                    <Link className='orangelinks'
                        href={
                            data.tx
                                ? `${GetExplorersGuruUrl()}/transaction/${data.tx}`
                                : `${GetExplorersGuruUrl()}/block/${data.blockId}`
                        }
                    >
                        {data.blockId}
                    </Link>
                ),
                timestamp: (data) => (<TimeTooltip datetime={data.timestamp} />),
                chainId: (stake) => (
                    <ChainWithIconLink chainId={stake.chainId} className="orangelinks" />

                ),
                chainBlockHeight: (data) => FormatNumberWithString(data.chainBlockHeight),
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerBlockReportsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderBlockReportsTab;