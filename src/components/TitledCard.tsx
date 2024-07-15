// jsinfo-ui/components/TitledCard.tsx

import React, { ReactNode } from 'react';
import { Card, Text } from "@radix-ui/themes";
import { FormatNumberWithString } from '@jsinfo/common/utils';

interface TitledCardProps {
    title: string;
    value: number | string | ReactNode;
    className?: string;
    formatNumber?: boolean;
    tooltip?: string;
}

const TitledCard: React.FC<TitledCardProps> = ({ title, value, className, formatNumber, tooltip }) => {

    let formattedValue;
    const value_is_string_or_number = typeof value === 'number' || typeof value === 'string'
    if (value_is_string_or_number && formatNumber) {
        formattedValue = FormatNumberWithString(value);
    } else if (value_is_string_or_number) {
        formattedValue = value + "";
    } else {
        formattedValue = value;
    }

    const card = (
        <Card className={`w-full ${className}`}>
            {title}
            <Text as="div" size="1" weight="bold">
                {formattedValue}
            </Text>
        </Card>
    );

    return tooltip ? <span title={tooltip}>{card}</span> : card;
};

export default TitledCard;