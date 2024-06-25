// src/components/BlockWithDateCard.tsx

import React, { FC } from 'react';
import { Flex, Text, Card, Box } from "@radix-ui/themes";
import Image from 'next/image';
import TimeTooltip from './TimeTooltip';
interface BlockData {
    height: number;
    datetime: Date | string;
}

interface BlockWithDateCardProps {
    blockData: BlockData;
}

export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'

const BlockWithDateCard: FC<BlockWithDateCardProps> = ({ blockData }) => (
    <Card>
        <Flex gap="3" align="center">
            <Box style={{ paddingLeft: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        width={40}
                        height={40}
                        src="/block-line.svg"
                        alt="export-csv"
                        style={{ display: 'inline-block', verticalAlign: 'middle', margin: '-15px', paddingBottom: '2px' }}
                    />
                    <Text size="2" weight="bold">
                        <span style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>Block {blockData.height}</span>
                    </Text>
                    <Text size="1" color="gray" style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>
                        <TimeTooltip datetime={blockData.datetime} />
                    </Text>
                </div>
            </Box>
        </Flex>
    </Card>
);

export default BlockWithDateCard;