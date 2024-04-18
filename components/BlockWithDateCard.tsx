// jsinfo-ui/components/BlockWithDateCard.tsx

import React from 'react';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { FormatTimeDifference } from '../src/utils';

const BlockWithDateCard = ({ blockData }) => (
    <Card>
        <Flex gap="3" align="center">
            <Box style={{ paddingLeft: '5px' }}>
                <Text size="2" weight="bold">
                    <img
                        width="40"
                        height="40"
                        src="/block-line.svg"
                        alt="export-csv"
                        style={{ margin: "-15px" }}
                    />
                    &nbsp; Block {blockData.height}
                </Text>
                <Text size="1" color="gray">
                    &nbsp;&nbsp;&nbsp;
                    {FormatTimeDifference(blockData.datetime)}
                </Text>
            </Box>
        </Flex>
    </Card>
);

export default BlockWithDateCard;