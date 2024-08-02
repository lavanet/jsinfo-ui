// src/app/provider/[lavaid]/_components/ProviderRewardsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import { GetExplorersGuruUrl } from '@jsinfo/common/env';

interface ProviderRewardsTabProps {
    addr: string;
}

const ProviderRewardsTab: React.FC<ProviderRewardsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "relay_payments.specId", name: "Spec" },
                { key: "relay_payments.blockId", name: "Block" },
                { key: "blocks.datetime", name: "Time" },
                { key: "relay_payments.consumer", name: "Consumer" },
                { key: "relay_payments.relays", name: "Relays" },
                { key: "relay_payments.cu", name: "CU" },
                { key: "relay_payments.qosSync", name: "QoS" },
                { key: "relay_payments.qosSyncExc", name: "QoS Excellence" },
            ]}
            tableDescription={
                <>
                    The reward event submited on chain by the provider.
                </>
            }
            dataKey={`providerRewards/${addr}`}
            defaultSortKey="relay_payments.id|desc"
            tableAndTabName="rewards"
            pkey="relay_payments.id"
            pkeyUrl="none"
            rowFormatters={{
                "relay_payments.specId": (payment) => (
                    <Link href={`/spec/${payment.relay_payments.specId}`}>
                        {payment.relay_payments.specId}
                    </Link>
                ),
                "relay_payments.blockId": (payment) => (
                    <Link
                        href={
                            payment.relay_payments.tx
                                ? `${GetExplorersGuruUrl()}/transaction/${payment.relay_payments.tx}`
                                : `${GetExplorersGuruUrl()}/block/${payment.relay_payments.blockId}`
                        }
                    >
                        {payment.relay_payments.blockId}
                    </Link>
                ),
                "blocks.datetime": (payment) =>
                    (<TimeTooltip datetime={payment.blocks.datetime} />),
                "relay_payments.consumer": (payment) => (
                    <Link href={`/consumer/${payment.relay_payments.consumer}`}>
                        {payment.relay_payments.consumer}
                    </Link>
                ),
                "relay_payments.relays": (payment) =>
                    payment.relay_payments.relays,
                "relay_payments.cu": (payment) => payment.relay_payments.cu,
                "relay_payments.pay": (payment) =>
                    `${payment.relay_payments.pay} ULAVA`,
                "relay_payments.qosSync": (payment) =>
                    <span title={`Sync: ${payment.relay_payments.qosSync}, Availability: ${payment.relay_payments.qosAvailability}, Latency: ${payment.relay_payments.qosLatency}`}>
                        {payment.relay_payments.qosSync}, {payment.relay_payments.qosAvailability}, {payment.relay_payments.qosLatency}
                    </span>,
                "relay_payments.qosSyncExc": (payment) =>
                    <span title={`SyncExc: ${payment.relay_payments.qosSyncExc}, AvailabilityExc: ${payment.relay_payments.qosAvailabilityExc}, LatencyExc: ${payment.relay_payments.qosLatencyExc}`}>
                        {payment.relay_payments.qosSyncExc}, {payment.relay_payments.qosAvailabilityExc}, {payment.relay_payments.qosLatencyExc}
                    </span>,
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerRewardsCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderRewardsTab;