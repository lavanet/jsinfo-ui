// src/app/consumers/_components/ConsumerSubscriptionsTab.tsx

"use client";

import { FormatNumber, FormatNumberWithString, IsMeaningfulText } from '@jsinfo/lib/formatting';
import { DataKeySortableTableInATabComponent } from "@jsinfo/components/classic/DynamicSortTable";
import LavaWithTooltip from '@jsinfo/components/modern/LavaWithTooltip';
import TimeTooltip from '@jsinfo/components/modern/TimeTooltip';

interface ConsumerSubscriptionsTabProps {
    addr: string;
}

function FormatMonthExpiry(data: any): React.ReactNode {
    try {
        if (!IsMeaningfulText(data.month_expiry)) return "";

        const expiryDate = new Date(parseInt(data.month_expiry + ""));
        const displayDate = expiryDate.toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        if (displayDate.includes("Jan 21, 1970") || displayDate.includes("Jan 20, 1970")) return "-";

        const fullDateTitle = expiryDate.toISOString();

        return (
            <span title={fullDateTitle}>{displayDate}</span>
        );
    } catch (error) {
        return data.month_expiry + "";
    }
}

const ConsumerSubscriptionsTab: React.FC<ConsumerSubscriptionsTabProps> = ({ addr }) => {

    return (
        <DataKeySortableTableInATabComponent
            columns={[
                { key: "createdAt", name: "Updated" },
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
                credit: (data: any) => <LavaWithTooltip amount={data.credit} />,
                month_expiry: (data: any) => FormatMonthExpiry(data.month_expiry),
                createdAt: (data: any) => <TimeTooltip datetime={data.createdAt} />,
            }}
        />
    );
};

export default ConsumerSubscriptionsTab;