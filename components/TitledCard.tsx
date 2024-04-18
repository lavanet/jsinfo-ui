// jsinfo-ui/components/TitledCard.tsx

import React from 'react';
import { Card, Text } from "@radix-ui/themes";

const TitledCard = ({ title, value }) => (
    <Card style={{ width: '100%' }}>
        {title}
        <Text as="div" size="2" weight="bold">
            {value}
        </Text>
    </Card>
);

export default TitledCard;