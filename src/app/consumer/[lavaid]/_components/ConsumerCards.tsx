// src/app/consumer/[lavaid]/_components/ConsumerCards.tsx

import React from 'react';
import StatCard from '@jsinfo/components/sections/StatCard';
import { MonitorCog, ArrowUpNarrowWide, CreditCard } from 'lucide-react';
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import LoaderImageForCards from '@jsinfo/components/modern/LoaderImageForCards';

interface ConsumerCardsProps {
    lavaid: string;
}

const ConsumerCards: React.FC<ConsumerCardsProps> = ({ lavaid }) => {
    const { data: consumer, loading, error } = useApiFetch('consumerV2/' + lavaid);

    if (error) return <ErrorDisplay message={error} />;

    if (loading) return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <StatCard
                title="Cu Sum"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Relay Sum"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Pay Sum"
                value={<LoaderImageForCards />}
                className="col-span-1"
                formatNumber={false}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <StatCard
                title="Cu Sum"
                value={consumer.cuSum}
                className="col-span-1"
                formatNumber={true}
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Relay Sum"
                value={consumer.relaySum}
                className="col-span-1"
                formatNumber={true}
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Pay Sum"
                value={consumer.rewardSum}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );
};

export default ConsumerCards;