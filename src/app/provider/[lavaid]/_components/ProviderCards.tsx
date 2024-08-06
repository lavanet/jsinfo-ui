// src/app/provider/[lavaid]/_components/ProviderCards.tsx

import { Flex } from "@radix-ui/themes";
import TitledCard from "@jsinfo/components/TitledCard";
import { useApiDataFetch } from "@jsinfo/hooks/useApiDataFetch";
import { RenderInFullPageCard } from "@jsinfo/common/utils";
import { ErrorDisplay } from "@jsinfo/components/ErrorDisplay";
import LoadingIndicator from "@jsinfo/components/LoadingIndicator";

interface ProviderCardsProps {
    addr: string;
}

const ProviderCards: React.FC<ProviderCardsProps> = ({ addr }) => {
    const { data, loading, error } = useApiDataFetch({
        dataKey: "providerCards/" + addr,
    });

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${addr} provider page`} greyText={`${addr} provider`} />);

    const provider = data;

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
                value={`${provider.rewardSum} ULAVA`}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
                tooltip="Total rewards for provider"
            />
            <TitledCard
                title="Total Stake"
                value={`${provider.stakeSum} ULAVA`}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
                tooltip="Total stake for all specs"
            />
            <TitledCard
                title="Total Claimed Rewards (All Time)"
                value={provider.claimedRewardsAllTime.toUpperCase()}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
            />
            <TitledCard
                title="Total Claimed Rewards (30 days ago)"
                value={provider.claimedRewards30DaysAgo.toUpperCase()}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
            />
            <TitledCard
                title="Claimable Rewards"
                value={provider.claimableRewards.toUpperCase()}
                className="col-span-2 md:col-span-1"
                formatNumber={true}
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