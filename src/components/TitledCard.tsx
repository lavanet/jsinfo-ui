// jsinfo-ui/components/TitledCard.tsx

import React from 'react';
import { Card, Text } from "@radix-ui/themes";
import { FormatNumberWithString } from '@jsinfo/common/utils';

interface TitledCardProps {
    title: string;
    value: number | string;
    className?: string;
    formatNumber?: boolean;
    tooltip?: string;
}

const TitledCard: React.FC<TitledCardProps> = ({ title, value, className, formatNumber, tooltip }) => {

    let formattedValue = formatNumber ? FormatNumberWithString(value) : value.toString();

    const card = (
        <Card className={`w-full ${className}`}>
            {title}
            <Text as="div" size="2" weight="bold">
                {formattedValue}
            </Text>
        </Card>
    );

    return tooltip ? <span title={tooltip}>{card}</span> : card;
};

export default TitledCard;