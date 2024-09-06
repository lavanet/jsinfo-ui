// src/components/MonikerAndProviderAddressCard.tsx

import React from 'react';
import Image from 'next/image';
import { Text } from "@radix-ui/themes";
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import ProviderMoniker from '../classic/ProviderMoniker';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import ModernTooltip from './ModernTooltip';

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

const MonikerAndProviderAddressCard: React.FC<MonikerAndProviderAddressCardProps> = ({ provider }: MonikerAndProviderAddressCardProps) => {
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

export default MonikerAndProviderAddressCard;