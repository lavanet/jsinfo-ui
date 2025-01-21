// src/components/modern/CurrencyChangeButton.tsx
"use client"

import React, { useState, useEffect, FC } from 'react';
import { DollarSign } from 'lucide-react';
import { Toggle } from '@jsinfo/components/shadcn/ui/Toggle';
import { GetInfoNetwork } from '@jsinfo/lib/env';

const CurrencyChangeButton: FC = () => {
    const isBrowser = typeof window !== 'undefined';

    const [currency, setCurrency] = useState(() => {
        return isBrowser ? localStorage.getItem('currency') || 'USD' : 'USD';
    });

    const isMainnet = GetInfoNetwork().toLowerCase() === 'mainnet';

    useEffect(() => {
        if (isBrowser) {
            localStorage.setItem('currency', currency);
        }
    }, [currency]);

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'USD' ? 'LAVA' : 'USD');
    };

    // return null;

    // if (!isMainnet) {
    //     return null;
    // }

    return (
        <div className="flex justify-between items-center">
            <Toggle variant="outline" aria-label="Toggle currency" pressed={currency === 'LAVA'} onPressedChange={toggleCurrency}>
                {currency === 'USD' ? <DollarSign className="h-4 w-4" /> : 'LAVA'}
            </Toggle>
        </div>
    );
};

export default CurrencyChangeButton;