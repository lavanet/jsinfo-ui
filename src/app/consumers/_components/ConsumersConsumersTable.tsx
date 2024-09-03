// src/app/consumers/_components/ConsumersConsumersTable.tsx

"use client";

import { Box } from "@radix-ui/themes";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { SortableTableInATabComponent } from "@jsinfo/components/legacy/StaticSortTable";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import { FormatNumber } from '@jsinfo/lib/formatting';
import { RenderInFullPageCard } from '@jsinfo/lib/utils';
import { ErrorDisplay } from '@jsinfo/components/legacy/ErrorDisplay';
import Link from "next/link";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";

const ConsumersConsumersTable: React.FC<{}> = () => {
    const { data, loading, error } = useApiFetch("consumerspageConsumers");

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
                    consumer: (data) => (<Link className='orangelinks' href={`/consumer/${data.consumer}`}>
                        {data.consumer}
                    </Link>),
                    cuSum: (data) => FormatNumber(data.cuSum),
                    relaySum: (data) => FormatNumber(data.relaySum),
                    rewardSum: (data) => <LavaWithTooltip amount={data.rewardSum} />,
                    qosSyncAvg: (data) => FormatNumber(data.qosSyncAvg),
                    qosSyncExcAvg: (data) => FormatNumber(data.qosSyncExcAvg),
                }}
            />
        </Box>
    );
};

export default ConsumersConsumersTable;