// src/components/MonikerAndProviderLink.tsx

import React from 'react';
import Link from 'next/link';
import { ProviderMonikerFullInfo } from '@jsinfo/common/types';
import { IsMeaningfulText } from '@jsinfo/common/utils';
import { Text } from "@radix-ui/themes";

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
                <span title={provider.monikerfull}>
                    <Link href={`/provider/${provider.provider}`}>
                        {provider.provider}
                    </Link>
                </span>
            );
        } else if (IsMeaningfulText(provider.provider)) {
            return (
                <Link href={`/provider/${provider.provider}`}>
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