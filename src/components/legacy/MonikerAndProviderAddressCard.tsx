// src/components/MonikerAndProviderAddressCard.tsx

import React from 'react';
import Image from 'next/image';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { IsMeaningfulText } from '@jsinfo/lib/formatting';
import ProviderMoniker from './ProviderMoniker';
import { ProviderMonikerFullInfo } from '@jsinfo/lib/types';
import ModernTooltip from '../modern/ModernTooltip';

interface MonikerAndProviderAddressCardProps {
    provider: ProviderMonikerFullInfo;
}

const renderUserIcon = () => (
    <div style={{ margin: "-15px" }}>
        <Image
            src="/user-line.svg"
            width={40}
            height={40}
            alt="user"
        />
    </div>
);

const renderMoniker = (moniker: string, monikerfull: string) => (
    <ModernTooltip title={monikerfull}>
        <Text as="div" weight="bold" style={{ marginLeft: '10px', whiteSpace: 'nowrap', fontSize: '16px' }}>
            <ProviderMoniker moniker={moniker} />
        </Text>
    </ModernTooltip>
);

const renderProviderAddressInLineWithIcon = (provider: string) => (
    <Text as="div" style={{ marginLeft: '10px', whiteSpace: 'nowrap', fontSize: '16px', color: 'white' }}>
        {provider}
    </Text>
);

const renderProviderAddressOnNewLine = (provider: string) => (
    <Text as="div" style={{ marginLeft: '20px', whiteSpace: 'nowrap', fontSize: '14px', marginTop: '4px' }}>
        {provider}
    </Text>
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
        <Card>
            <Flex gap="3" align="center">
                <Box style={{ paddingLeft: '5px' }}>
                    {renderProviderInfo()}
                </Box>
            </Flex>
        </Card>
    );
};

export default MonikerAndProviderAddressCard;