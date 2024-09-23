// src/components/sections/StatCard.tsx

import React, { ReactNode } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@jsinfo/components/shadcn/ui/Card';
import { FormatNumberWithString } from '@jsinfo/lib/formatting';
import ModernTooltip from '../modern/ModernTooltip';

interface StatCardProps {
    title: string;
    value: number | string | null | React.ReactNode;
    footer?: string | null;
    icon?: ReactNode | null;
    formatNumber?: boolean;
    className?: string;
    tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, footer, icon, formatNumber, className, tooltip }) => {
    let formattedValue;
    const value_is_string_or_number = typeof value === 'number' || typeof value === 'string'
    if (value_is_string_or_number && formatNumber) {
        formattedValue = FormatNumberWithString(value);
    } else if (value_is_string_or_number) {
        formattedValue = value + "";
    } else {
        formattedValue = value;
    }

    return (
        <ModernTooltip title={tooltip}>
            <Card className={`w-full ${className}`} style={{ backgroundColor: 'var( --background-color)' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {title}
                    </CardTitle>
                    {icon}
                </CardHeader>
                <CardContent className='flex justify-start'>
                    <div className="text-2xl font-bold" style={{ display: 'inline-block', textAlign: 'left', whiteSpace: 'nowrap' }}>{formattedValue}</div>
                    {footer && (
                        <p className="text-xs text-muted-foreground">
                            {footer}
                        </p>
                    )}
                </CardContent>
            </Card>
        </ModernTooltip>
    );
};

export default StatCard;
