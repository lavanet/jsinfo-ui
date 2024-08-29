// src/components/MonikerWithTooltip.tsx

import React from 'react';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import { Text } from "@radix-ui/themes";

interface MonikerWithTooltipProps {
    provider: ProviderMonikerFullInfo;
}

const MonikerWithTooltip: React.FC<MonikerWithTooltipProps> = ({ provider }: MonikerWithTooltipProps) => {
    if (!provider) return null;

    try {
        if (!provider || typeof provider !== 'object') {
            throw new Error('Invalid provider object');
        }

        if (IsMeaningfulText(provider.moniker)) {
            return (
                <span title={provider.monikerfull}>
                    {provider.moniker}
                </span>
            );
        } else {
            return "";
        }
    } catch (error) {
        console.error('Error rendering provider info:', error);
        return (<>
            <Text color="red">
                Invalid moniker data
            </Text>
        </>)
    }
};

export default MonikerWithTooltip;