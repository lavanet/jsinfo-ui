// src/components/ProviderCard.tsx

import React from 'react';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import Image from 'next/image';

interface Provider {
    moniker: string;
    addr: string;
}

interface ProviderCardProps {
    provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => (
    <Card>
        <Flex gap="3" align="center">
            <Box style={{ paddingLeft: '5px' }}>
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
                        {provider.moniker}
                    </Text>
                </div>
                <Text as="div" size="2" color="gray" style={{ whiteSpace: 'nowrap' }}>
                    {provider.addr}
                </Text>
            </Box>
        </Flex>
    </Card>
);

export default ProviderCard;