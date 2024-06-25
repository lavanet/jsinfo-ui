// src/components/ProviderMoniker.tsx

import React from 'react';
import Link from 'next/link';

interface ProviderMonikerProps {
    moniker: string;
}

const ProviderMoniker: React.FC<ProviderMonikerProps> = ({ moniker }) => {
    if (moniker === 'lava-donkamote') {
        // https://info.lavanet.xyz/provider/lava@1w39wm9tp6nsy7tsxlkfwy98f7p6wsq54vx4f23#health
        return (
            <Link href="https://donkamote.xyz/blockchain-explorers" target="_blank" rel="noopener noreferrer">
                {moniker}
            </Link>
        );
    } else if (moniker === 'GateOmega') {
        // https://info.lavanet.xyz/provider/lava@1jqwgsmrcrmhncvn7u50sr5yag8sdmg7hfx3l74#health
        return (
            <Link href="https://gateomega.com/#networks" target="_blank" rel="noopener noreferrer">
                {moniker}
            </Link>
        );
    } else {
        return <>{moniker}</>;
    }
};

export default ProviderMoniker;