// src/components/MonikerAndProviderLink.tsx

import React from 'react';
import Link from 'next/link';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import { Text } from "@radix-ui/themes";
import ModernTooltip from '../modern/ModernTooltip';

interface MonikerAndProviderLinkProps {
    provider: ProviderMonikerFullInfo;
}

const MonikerAndProviderLink: React.FC<MonikerAndProviderLinkProps> = ({ provider }: MonikerAndProviderLinkProps) => {
    if (!provider) return null;

    try {
        if (!provider || typeof provider !== 'object') {
            throw new Error('Invalid provider object');
        }

        if (IsMeaningfulText(provider.moniker) && IsMeaningfulText(provider.provider)) {
            return (
                <ModernTooltip title={provider.monikerfull || provider.moniker}>
                    <Link className='orangelinks' href={`/provider/${provider.provider}`}>
                        {provider.moniker}
                    </Link>
                </ModernTooltip>
            );
        } else if (IsMeaningfulText(provider.provider)) {
            return (
                <Link className='orangelinks' href={`/provider/${provider.provider}`}>
                    {provider.provider}
                </Link>
            );
        } else {
            return (<>
                <Text color="red">
                    No provider address
                </Text>
            </>)
        }
    } catch (error) {
        console.error('Error rendering provider info:', error);
        return (<>
            <Text color="red">
                Invalid provider/moniker data
            </Text>
        </>)
    }
};

export default MonikerAndProviderLink;