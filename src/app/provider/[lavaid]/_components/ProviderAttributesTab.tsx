// src/app/provider/[lavaid]/_components/ProviderEventsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/TableCsvButton";
import { GeoLocationToString, StatusToString } from '@jsinfo/common/convertors';
import StatusCall from '@jsinfo/components/StatusCell';

interface ProviderEventsTabProps {
    addr: string;
}

const ProviderEventsTab: React.FC<ProviderEventsTabProps> = ({ addr }) => {
    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "specId", name: "Spec" },
                { key: "status", name: "Status" },
                { key: "geolocation", name: "Geolocation" },
                { key: "addons", name: "Addons" },
                { key: "extensions", name: "Extensions" },
            ]}
            dataKey={`providerStakes/${addr}`}
            defaultSortKey="specId"
            tableAndTabName="attributes"
            pkey="specId"
            pkeyUrl="spec"
            rowFormatters={{
                specId: (data) => (
                    <Link href={`/spec/${data.specId}`}>{data.specId}</Link>
                ),
                status: (data) => <StatusCall status={StatusToString(data.status)} />,
                geolocation: (data) => GeoLocationToString(data.geolocation),
            }}
            csvButton={(
                <TableCsvButton
                    csvDownloadLink={`providerStakesCsv/${addr}`}
                />
            )}
        />
    );
};

export default ProviderEventsTab;