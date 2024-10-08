// src/app/provider/[lavaid]/_components/ProviderRewardsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';
import { GetExplorersGuruUrl } from '@jsinfo/lib/env';
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

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
                    <ChainWithIconLink chainId={payment.relay_payments.specId} className="orangelinks" />
                ),
                "relay_payments.blockId": (payment) => (
                    <Link className='orangelinks'
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
                    <Link className='orangelinks' href={`/consumer/${payment.relay_payments.consumer}`}>
                        {payment.relay_payments.consumer}
                    </Link>
                ),
                "relay_payments.relays": (payment) =>
                    payment.relay_payments.relays,
                "relay_payments.cu": (payment) => payment.relay_payments.cu,
                "relay_payments.pay": (payment) =>
                    `${payment.relay_payments.pay} ULAVA`,
                "relay_payments.qosSync": (payment) =>
                    <ModernTooltip title={`Sync: ${payment.relay_payments.qosSync}, Availability: ${payment.relay_payments.qosAvailability}, Latency: ${payment.relay_payments.qosLatency}`}>
                        {payment.relay_payments.qosSync}, {payment.relay_payments.qosAvailability}, {payment.relay_payments.qosLatency}
                    </ModernTooltip>,
                "relay_payments.qosSyncExc": (payment) =>
                    <ModernTooltip title={`SyncExc: ${payment.relay_payments.qosSyncExc}, AvailabilityExc: ${payment.relay_payments.qosAvailabilityExc}, LatencyExc: ${payment.relay_payments.qosLatencyExc}`}>
                        {payment.relay_payments.qosSyncExc}, {payment.relay_payments.qosAvailabilityExc}, {payment.relay_payments.qosLatencyExc}
                    </ModernTooltip>,
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