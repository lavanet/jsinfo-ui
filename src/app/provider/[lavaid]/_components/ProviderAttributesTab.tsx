// src/app/provider/[lavaid]/_components/ProviderEventsTab.tsx

"use client";

import Link from 'next/link'
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import TableCsvButton from "@jsinfo/components/classic/TableCsvButton";
import { GeoLocationToString, StatusToString } from '@jsinfo/lib/convertors';
import StatusCall from '@jsinfo/components/modern/StatusCell';

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
                    <Link className='orangelinks' href={`/chain/${data.specId}`}>{data.specId}</Link>
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