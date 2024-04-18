

import React from 'react';
import { Flex, Text, Card, Box } from "@radix-ui/themes";

const ProviderCard = ({ provider }) => (
    <Card>
        <Flex gap="3" align="center">
            <Box style={{ paddingLeft: '5px' }}>
                <Text as="div" size="2" weight="bold">
                    <img
                        width="40"
                        height="40"
                        src="/user-line.svg"
                        alt="user"
                        style={{ margin: "-15px" }}
                    />
                    &nbsp;&nbsp;
                    {provider.moniker}
                </Text>
                <Text as="div" size="2" color="gray">
                    {provider.addr}
                </Text>
            </Box>
        </Flex>
    </Card>
);

export default ProviderCard;