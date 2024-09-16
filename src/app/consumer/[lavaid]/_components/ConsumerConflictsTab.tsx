// src/app/consumer/[lavaid]/_components/ConsumerConflictsTab.tsx

import React from 'react';
import Link from 'next/link';
import { SortableTableInATabComponent } from "@jsinfo/components/classic/StaticSortTable";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";

interface ConsumerConflictsTableProps {
    lavaid: string;
}

const ConsumerConflictsTable: React.FC<ConsumerConflictsTableProps> = ({ lavaid }) => {
    const { data: consumer, loading, error } = useApiFetch('consumerConflicts/' + lavaid);

    if (error) return <ErrorDisplay message={error} />;
    if (loading) return <LoadingIndicator loadingText={`Loading ${lavaid} conflicts data`} greyText={`${lavaid} conflicts`} />;

    return (
        <SortableTableInATabComponent
            columns={[
                { key: "specId", name: "Spec" },
                { key: "requestBlock", name: "Block" },
                { key: "apiInterface", name: "Interface" },
                { key: "connectionType", name: "Connection Type" },
                { key: "requestData", name: "Request Data" },
                { key: "apiURL", name: "Api URL" },
            ]}
            data={consumer.conflicts || []}
            defaultSortKey="requestBlock"
            tableAndTabName="conflicts"
            pkey="id"
            pkeyUrl="none"
            rowFormatters={{
                specId: (data) => (
                    <Link className='orangelinks' href={`/chain/${data.specId}`}>{data.specId}</Link>
                ),
            }}
        />
    );
};

export default ConsumerConflictsTable;