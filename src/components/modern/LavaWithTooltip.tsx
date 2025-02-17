// src/components/modern/LavaWithTooltip.tsx

import React from 'react';
import { FormatNumber } from '@jsinfo/lib/formatting';
import ModernTooltip from './ModernTooltip';

interface LavaWithTooltipProps {
    amount: number | string;
}

function formatUlava(input: string | number): string {
    const numberValue = Number(input);
    return `${FormatNumber(numberValue)} ULAVA`;
}

const LavaWithTooltip: React.FC<LavaWithTooltipProps> = ({ amount }: LavaWithTooltipProps) => {
    if (!amount) return null;

    const numberAmount = Number(amount);
    const ulavaValue = formatUlava(numberAmount);
    const lavaAmount = numberAmount / 1_000_000;
    const formattedLava = `${FormatNumber(Number(lavaAmount.toFixed(2)))} LAVA`;

    return (
        <ModernTooltip title={ulavaValue}>
            <span style={{ whiteSpace: 'nowrap' }}>{formattedLava}</span>
        </ModernTooltip>
    );
};

export default LavaWithTooltip;