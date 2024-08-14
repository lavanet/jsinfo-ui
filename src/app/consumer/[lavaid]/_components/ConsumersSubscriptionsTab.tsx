// src/app/consumers/_components/ConsumerSubscriptionsTab.tsx

"use client";

import { FormatNumber, FormatNumberWithString } from '@jsinfo/common/utils';
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/DynamicSortTable";
import TimeTooltip from '@jsinfo/components/TimeTooltip';

interface ConsumerSubscriptionsTabProps {
    addr: string;
}

const ConsumerSubscriptionsTab: React.FC<ConsumerSubscriptionsTabProps> = ({ addr }) => {

    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "createdAt", name: "Update Timestamp" },
                { key: "plan", name: "Plan" },
                { key: "duration_bought", name: "Duration Bought" },
                { key: "duration_left", name: "Duration Left" },
                { key: "month_expiry", name: "Month Expiry" },
                { key: "month_cu_left", name: "Month CU (left)" },
                { key: "month_cu_total", name: "Month CU (total)" },
                { key: "cluster", name: "Cluster" },
                { key: "duration_total", name: "Duration Total" },
                { key: "auto_renewal_next_plan", name: "Auto Renewal Next Plan" },
                { key: "future_subscription", name: "Future Subscription" },
                { key: "credit", name: "Credit" },
            ]}
            tableDescription={
                <span style={{ color: 'grey' }}>
                    Output of <span style={{ color: 'white' }}>&apos;lavad q subscription list&apos;</span> when changes are detected
                </span>
            }
            dataKey={`consumerSubscriptions/${addr}`}
            defaultSortKey="consumer|desc"
            tableAndTabName="subscriptions"
            pkey="id"
            rowFormatters={{
                month_cu_left: (data: any) => FormatNumber(data.month_cu_left),
                month_cu_total: (data: any) => FormatNumber(data.month_cu_total),
                credit: (data: any) => FormatNumberWithString(data.credit),
                month_expiry: (data: any) => {
                    try {
                        const expiryDate = new Date(parseInt(data.month_expiry + ""));

                        const displayDate = expiryDate.toLocaleString('en-US', {
                            month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        if (displayDate.includes("Jan 21, 1970")) return "-";

                        const fullDateTitle = expiryDate.toISOString();

                        return (
                            <span title={fullDateTitle}>{displayDate}</span>
                        );
                    } catch (error) {
                        return data.month_expiry + "";
                    }
                },
                createdAt: (data: any) => <TimeTooltip datetime={data.createdAt} />,
            }}
        />
    );
};

export default ConsumerSubscriptionsTab;