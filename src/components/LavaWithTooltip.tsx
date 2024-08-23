// src/components/LavaWithTooltip.tsx

import React from 'react';
import { FormatNumber, FormatNumberWithString } from '@jsinfo/common/utils';

interface LavaWithTooltipProps {
    amount: number | string;
}

export function FormatAsULava(input: string | number): string {
    let inputStr = input.toString().toLowerCase().trim().replace(/,/g, "");

    if (/^\d+$/.test(inputStr)) {
        const numberPart = parseInt(inputStr, 10);
        return `${FormatNumber(numberPart)} ULAVA`;
    }

    return FormatNumberWithString(inputStr.toUpperCase());
}

export function ConvertULavaToLava(input: string | number): string | null {
    let inputStr = input.toString().toLowerCase().trim().replace(/,/g, "");

    if (/^\d+$/.test(inputStr)) {
        const numberPart = parseInt(inputStr, 10);
        const result = Math.round((numberPart / 1e6) * 10) / 10;
        if (result <= 100) {
            return null
        }
        return `${FormatNumber(result)} LAVA`;
    }

    const match = inputStr.match(/(\d+)\s*ulava$/);

    if (match) {
        const numberPart = parseInt(match[1], 10);
        const result = Math.round((numberPart / 1e6) * 10) / 10;
        if (result <= 100) {
            return null
        }
        return `${FormatNumber(result)} LAVA`;
    }

    return null;
}

const LavaWithTooltip: React.FC<LavaWithTooltipProps> = ({ amount }: LavaWithTooltipProps) => {
    if (!amount) return 0;

    let ulavaValue = FormatAsULava(amount);
    let lavaValue = ConvertULavaToLava(amount);

    if (lavaValue) {
        return (
            <span title={ulavaValue}>
                {lavaValue}
            </span>
        );
    }

    return ulavaValue;

};

export default LavaWithTooltip;