// jsinfo-ui/components/TitledCard.tsx

import React from 'react';
import { Card, Text } from "@radix-ui/themes";

interface TitledCardProps {
    title: string;
    value: number | string;
    className?: string;
    formatNumber?: boolean;
}

const TitledCard: React.FC<TitledCardProps> = ({ title, value, className, formatNumber }) => {
    const formatter = new Intl.NumberFormat('en-US');

    let formattedValue = value.toString();
    if (formatNumber) {
        // Convert value to string before extracting the number part and the string part
        const valueString = value.toString();
        const numberPart = parseFloat(valueString);
        const stringPart = isNaN(numberPart) ? valueString : valueString.replace(numberPart.toString(), '');

        // Apply the formatter to the number part and append the string part
        formattedValue = !isNaN(numberPart) ? formatter.format(numberPart) + stringPart : valueString;
    }

    return (
        <Card className={`w-full ${className}`}>
            {title}
            <Text as="div" size="2" weight="bold">
                {formattedValue}
            </Text>
        </Card>
    );
};

export default TitledCard;