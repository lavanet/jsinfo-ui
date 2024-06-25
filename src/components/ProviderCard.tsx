// src/components/ProviderCard.tsx

import React from 'react';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import Image from 'next/image';
import { IsMeaningfulText } from '../common/utils';
import ProviderMoniker from './ProviderMoniker';

interface Provider {
    moniker: string;
    addr: string;
}

interface ProviderCardProps {
    provider: Provider;
}

export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
    const renderProviderInfo = () => {
        if (IsMeaningfulText(provider.moniker) && IsMeaningfulText(provider.addr)) {
            return (
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ margin: "-15px" }}>
                            <Image
                                src="/user-line.svg"
                                width={40}
                                height={40}
                                alt="user"
                            />
                        </div>
                        <Text as="div" size="2" weight="bold" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
                            <ProviderMoniker moniker={provider.moniker} />
                        </Text>
                    </div>
                    <Text as="div" size="2" color="gray" style={{ whiteSpace: 'nowrap' }}>
                        {provider.addr}
                    </Text>
                </>
            );
        } else if (IsMeaningfulText(provider.addr)) {
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ margin: "-15px" }}>
                        <Image
                            src="/user-line.svg"
                            width={40}
                            height={40}
                            alt="user"
                        />
                    </div>
                    <Text as="div" size="2" color="gray" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
                        {provider.addr}
                    </Text>
                </div>
            );
        } else {
            return (
                <Text as="div" size="2" color="red" style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
                    Error: No provider information available
                </Text>
            );
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

export default ProviderCard;
