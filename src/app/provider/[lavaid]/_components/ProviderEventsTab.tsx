// src/app/provider/[lavaid]/_components/ProviderEventsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import { EventTypeToString } from '@jsinfo/common/convertors';

interface ProviderEventsTabProps {
    addr: string;
}

const ProviderEventsTab: React.FC<ProviderEventsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "events.eventType", name: "Event Type" },
                { key: "blocks.height", name: "Block Height" },
                { key: "blocks.datetime", name: "Time" },
                { key: "events.t1", name: "Text1" },
                { key: "events.t2", name: "Text2" },
                { key: "events.t3", name: "Text3" },
                { key: "events.b1", name: "BigInt1" },
                { key: "events.b2", name: "BigInt2" },
                { key: "events.b3", name: "BigInt3" },
                { key: "events.i1", name: "Int1" },
                { key: "events.i2", name: "Int2" },
                { key: "events.i3", name: "Int3" },
            ]}
            tableDescription={
                <>
                    Lava blockchain events related to providers with thier key value fields
                </>
            }
            dataKey={`providerEvents/${addr}`}
            defaultSortKey="events.id|desc"
            tableAndTabName="events"
            pkey="events.id"
            pkeyUrl="none"
            rowFormatters={{
                "events.eventType": (evt) => (
                    <Link
                        href={
                            evt.events.tx
                                ? `https://lava.explorers.guru/transaction/${evt.events.tx}`
                                : `https://lava.explorers.guru/block/${evt.events.blockId}`
                        }
                    >
                        {EventTypeToString(evt.events.eventType)}
                    </Link>
                ),
                "blocks.height": (evt) => (
                    <Link
                        href={`https://lava.explorers.guru/block/${evt.events.blockId}`}
                    >
                        {evt.events.blockId}
                    </Link>
                ),
                "blocks.datetime": (evt) =>
                    (<TimeTooltip datetime={evt.blocks.datetime} />),
                text1: (evt) => {
                    return (
                        <div
                            style={{
                                wordBreak: "break-all",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {evt.events.t1}
                        </div>
                    );
                },
                text2: (evt) => {
                    return (
                        <div
                            style={{
                                wordBreak: "break-all",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {evt.events.t2}
                        </div>
                    );
                },
                text3: (evt) => {
                    return (
                        <div
                            style={{
                                wordBreak: "break-all",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {evt.events.t3}
                        </div>
                    );
                },
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerEventsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderEventsTab;