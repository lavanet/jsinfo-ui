// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import { Flex } from "@radix-ui/themes";
import TitledCard from "@jsinfo/components/legacy/TitledCard";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { RenderInFullPageCard } from "@jsinfo/lib/utils";
import { ErrorDisplay } from "@jsinfo/components/legacy/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/legacy/LoadingIndicator";
import LavaWithTooltip from "@jsinfo/components/legacy/LavaWithTooltip";

interface ProviderCardsProps {
    addr: string;
}

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }) => {
    const { data, loading, error } = useApiDataFetch({
        dataKey: "providerCards/" + addr,
    });

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${addr} details`} greyText={`${addr} provider`} />);

    const provider = data;

    const requiredFields = ['cuSum', 'relaySum', 'rewardSum', 'stakeSum', 'claimedRewardsAllTime', 'claimedRewards30DaysAgo', 'claimableRewards'];

    const allFieldsPresent = requiredFields.every(field => provider.hasOwnProperty(field));

    if (!allFieldsPresent) {
        return RenderInFullPageCard(<ErrorDisplay message="Provider data is incomplete or unavailable." />);
    }

    return (
        <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-4">
            <TitledCard
                title="Total CU"
                value={provider.cuSum}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total compute units for provider"
            />
            <TitledCard
                title="Total Relays"
                value={provider.relaySum}
                className="col-span-1"
                formatNumber={true}
                tooltip="Total relays for provider"
            />
            <TitledCard
                title="Total Rewards"
                value={<LavaWithTooltip amount={provider.rewardSum} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                tooltip="Total rewards for provider"
            />
            <TitledCard
                title="Total Stake"
                value={<LavaWithTooltip amount={provider.stakeSum} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
                tooltip="Total stake for all specs"
            />
            <TitledCard
                title="Total Claimed Rewards (All Time)"
                value={<LavaWithTooltip amount={provider.claimedRewardsAllTime} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
            />
            <TitledCard
                title="Total Claimed Rewards (30 days ago)"
                value={<LavaWithTooltip amount={provider.claimedRewards30DaysAgo} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
            />
            <TitledCard
                title="Claimable Rewards"
                value={<LavaWithTooltip amount={provider.claimableRewards} />}
                className="col-span-2 md:col-span-1"
                formatNumber={false}
            />
        </Flex>
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