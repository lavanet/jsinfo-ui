// src/components/MonikerAndProviderAddressCard.tsx

import React from 'react';
import Image from 'next/image';
import { Text } from "@radix-ui/themes";
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import ProviderMoniker from '../../../../components/classic/ProviderMoniker';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import ModernTooltip from '../../../../components/modern/ModernTooltip';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { ErrorDisplay } from '../../../../components/modern/ErrorDisplay';
import LoadingIndicator from '../../../../components/modern/LoadingIndicator';

/*
      <h1 className="text-3xl font-bold mb-4">{providerData?.moniker || 'Unknown Provider'}</h1>
      <p className="text-muted-foreground mb-8">Address: {providerData?.provider || address}</p>
*/

interface MonikerAndProviderAddressCardProps {
    provider: ProviderMonikerFullInfo;
}

const renderUserIcon = () => (
    <div style={{ margin: "-15px", marginBottom: "-1px", marginLeft: "-25px" }}>
        <Image
            src="/user-line.svg"
            width={70}
            height={70}
            alt="user"
        />
    </div>
);

const renderMoniker = (moniker: string, monikerfull: string) => (
    <ModernTooltip title={monikerfull}>
        <h1 className="text-3xl font-bold mb-4">
            <ProviderMoniker moniker={moniker} />
        </h1>
    </ModernTooltip>
);

const renderProviderAddressInLineWithIcon = (provider: string) => (
    <h1 className="text-3xl font-bold mb-4">
        {provider}
    </h1>
);

const renderProviderAddressOnNewLine = (provider: string) => (
    <p className="text-muted-foreground mb-8" style={{ marginTop: '-7px' }}>
        Address:&nbsp;{provider}
    </p>
);

const renderError = () => (
    <Text as="div" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
        Error: Incomplete provider information
    </Text>
);

export const MonikerAndProviderAddressCard: React.FC<MonikerAndProviderAddressCardProps> = ({ provider }: MonikerAndProviderAddressCardProps) => {
    const renderProviderInfo = () => {
        try {
            if (!provider || typeof provider !== 'object') {
                throw new Error('Invalid provider object');
            }

            if (IsMeaningfulText(provider.moniker) && IsMeaningfulText(provider.provider)) {
                return (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {renderUserIcon()}
                            {renderMoniker(provider.moniker, provider.monikerfull)}
                        </div>
                        {renderProviderAddressOnNewLine(provider.provider)}
                    </>
                );
            } else if (IsMeaningfulText(provider.provider)) {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderUserIcon()}
                        {renderProviderAddressInLineWithIcon(provider.provider)}
                    </div>
                );
            } else {
                throw new Error('Incomplete provider information');
            }
        } catch (error) {
            console.error('Error rendering provider info:', error);
            return renderError();
        }
    };

    return (
        <div style={{ marginLeft: '23px' }}>
            {renderProviderInfo()}
        </div>
    );
};

export const MonikerAndProviderAddressCardWithFetch = ({ lavaId }: { lavaId: string }): { hasNoData: boolean, component: React.ReactElement } => {
    const { data: provider, loading, error } = useJsinfobeFetch("providerV2/" + lavaId);

    const checkForNoData = (obj: any): boolean => {
        return JSON.stringify(obj).toLowerCase().includes("does not exist");
    };

    if (loading) {
        return {
            hasNoData: false,
            component: <LoadingIndicator loadingText={`Loading ${lavaId} provider details`} greyText={`${lavaId} provider`} />
        };
    }

    if (error || checkForNoData(error) || checkForNoData(provider)) {
        return {
            hasNoData: true,
            component: <ErrorDisplay message="No data for provider found" />
        };
    }

    return {
        hasNoData: false,
        component: <MonikerAndProviderAddressCard provider={provider} />
    };
};
