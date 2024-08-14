// src/app/consumers/_components/ConsumersConsumersTable.tsx

"use client";

import { Box } from "@radix-ui/themes";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";
import { FormatNumber, RenderInFullPageCard } from '@jsinfo/common/utils';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import Link from "next/link";

const ConsumersConsumersTable: React.FC<{}> = () => {
    const { data, loading, error } = useApiDataFetch({
        dataKey: "consumerspageConsumers",
    });

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading consumers table data`} greyText={`consumers table`} />);

    return (
        <Box>
            <SortableTableInATabComponent
                columns={[
                    { key: "consumer", name: "Consumer" },
                    { key: "plan", name: "Plan" },
                    { key: "cuSum", name: "CU Sum" },
                    { key: "relaySum", name: "Relay Sum" },
                    { key: "rewardSum", name: "Reward Sum" },
                    { key: "qosSyncAvg", name: "Qos Sync Avg" },
                    { key: "qosSyncExcAvg", name: "Qos Sync Exc Avg" },
                ]}
                data={data.data}
                defaultSortKey="consumer|desc"
                tableAndTabName="consumers"
                pkey="consumer"
                pkeyUrl="consumer"
                rowFormatters={{
                    consumer: (data) => (<Link href={`/consumer/${data.consumer}`}>
                        {data.consumer}
                    </Link>),
                    cuSum: (data) => FormatNumber(data.cuSum),
                    relaySum: (data) => FormatNumber(data.relaySum),
                    rewardSum: (data) => FormatNumber(data.rewardSum),
                    qosSyncAvg: (data) => FormatNumber(data.qosSyncAvg),
                    qosSyncExcAvg: (data) => FormatNumber(data.qosSyncExcAvg),
                }}
            />
        </Box>
    );
};

export default ConsumersConsumersTable;