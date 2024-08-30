// src/components/modern/CurrencyChangeButton.tsx

import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Toggle } from '@jsinfo/components/ui/Toggle';
import { GetInfoNetwork } from '@jsinfo/lib/env';

const CurrencyChangeButton: FC = () => {
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
    const isMainnet = GetInfoNetwork().toLowerCase() === 'mainnet';

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'USD' ? 'LAVA' : 'USD');
    };

    if (!isMainnet) {
        return null;
    }

    return (
        <div className="flex justify-between items-center">
            <Toggle variant="outline" aria-label="Toggle currency" pressed={currency === 'LAVA'} onPressedChange={toggleCurrency}>
                {currency === 'USD' ? <DollarSign className="h-4 w-4" /> : 'LAVA'}
            </Toggle>
        </div>
    );
};

export default CurrencyChangeButton;