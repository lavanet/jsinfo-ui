// src/components/modern/MonikerWithTooltip.tsx

import React from 'react';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import { Text } from "@radix-ui/themes";
import ModernTooltip from './ModernTooltip';

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
                <ModernTooltip title={provider.monikerfull}>
                    <span style={{ textAlign: 'left', display: 'block' }}>
                        {provider.moniker}
                    </span>
                </ModernTooltip>
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