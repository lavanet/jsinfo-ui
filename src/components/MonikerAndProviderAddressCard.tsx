// src/components/MonikerAndProviderAddressCard.tsx

import React from 'react';
import Image from 'next/image';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { IsMeaningfulText } from '../common/utils';
import ProviderMoniker from './ProviderMoniker';
import { ProviderMonikerFullInfo } from '@jsinfo/common/types';

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
    <Text as="div" size="2" weight="bold" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
        <span title={monikerfull}>
            <ProviderMoniker moniker={moniker} />
        </span>
    </Text>
);

const renderProviderAddressInLineWithIcon = (provider: string) => (
    <Text as="div" size="2" color="gray" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
        {provider}
    </Text>
);

const renderProviderAddressOnNewLine = (provider: string) => (
    <Text as="div" size="2" color="gray" style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}>
        {provider}
    </Text>
);

const renderError = () => (
    <Text as="div" size="2" color="red" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
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