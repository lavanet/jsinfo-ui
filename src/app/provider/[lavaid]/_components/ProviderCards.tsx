// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import StatCard from "@jsinfo/components/sections/StatCard";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { RenderInFullPageCard } from "@jsinfo/lib/utils";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { ArrowUpNarrowWide, CalendarHeart, CreditCard, FolderHeart, HeartHandshake, Landmark, MonitorCog } from "lucide-react";

interface ProviderCardsProps {
    addr: string;
}

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }) => {
    const { data, loading, error } = useApiFetch("providerCards/" + addr);

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${addr} details`} greyText={`${addr} provider`} />);

    const provider = data;

    const requiredFields = ['cuSum', 'relaySum', 'rewardSum', 'stakeSum', 'claimedRewardsAllTime', 'claimedRewards30DaysAgo', 'claimableRewards'];

    const allFieldsPresent = requiredFields.every(field => provider.hasOwnProperty(field));

    if (!allFieldsPresent) {
        return RenderInFullPageCard(<ErrorDisplay message="Provider data is incomplete or unavailable." />);
    }

    return (<>
        <div style={{ marginTop: '20px' }}></div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard
                title="Total CU"
                value={provider.cuSum}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total compute units for provider"
                icon={<MonitorCog className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Relays"
                value={provider.relaySum}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total relays for provider"
                icon={<ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Rewards"
                value={<LavaWithTooltip amount={provider.rewardSum} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                tooltip="Total rewards for provider"
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Stake"
                value={<LavaWithTooltip amount={provider.stakeSum} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                tooltip="Total stake for all specs"
                icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Claimed Rewards (All Time)"
                value={<LavaWithTooltip amount={provider.claimedRewardsAllTime} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                icon={<FolderHeart className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Claimed Rewards (30 days ago)"
                value={<LavaWithTooltip amount={provider.claimedRewards30DaysAgo} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                icon={<CalendarHeart className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Claimable Rewards"
                value={<LavaWithTooltip amount={provider.claimableRewards} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                icon={<HeartHandshake className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
        <div style={{ marginTop: '25px' }}></div>
    </>
    );
};


const ProviderCardsMargined: React.FC<ProviderCardsProps> = ({ addr }) => {
    return (
        < div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
            <ProviderCards addr={addr} />
        </div>
    )
};

export default ProviderCardsMargined;