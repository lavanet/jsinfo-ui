
import React from 'react';
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import { Text } from "@radix-ui/themes";
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';

interface MonikerWithTooltipProps {
    provider: any;
}

const MonikerWithTooltip: React.FC<MonikerWithTooltipProps> = ({ provider }: MonikerWithTooltipProps) => {

    const renderAvatar = () => {
        if (provider.avatarUrl) {
            return (
                <img
                    src={provider.avatarUrl}
                    width={20}
                    height={20}
                    alt="provider avatar"
                    style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '8px',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                    }}
                />
            );
        }
        return null;
    };

    if (!provider) return null;

    try {
        if (!provider || typeof provider !== 'object') {
            throw new Error('Invalid provider object');
        }

        if (IsMeaningfulText(provider.moniker)) {
            return (
                <ModernTooltip title={provider.monikerfull}>
                    <span style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                        {renderAvatar()}
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