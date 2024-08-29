// src/components/ProviderMoniker.tsx

import React from 'react';
import Link from 'next/link';

interface ProviderMonikerProps {
    moniker: string;
}

// redirect traffic back to providers that redirect to us
const monikerUrls: { [key: string]: string } = {
    'lava-donkamote': 'https://donkamote.xyz/blockchain-explorers?utm_source=jsinfo', // https://info.lavanet.xyz/provider/lava@1w39wm9tp6nsy7tsxlkfwy98f7p6wsq54vx4f23#health
    'GateOmega': 'https://gateomega.com/#networks?utm_source=jsinfo', // https://info.lavanet.xyz/provider/lava@1jqwgsmrcrmhncvn7u50sr5yag8sdmg7hfx3l74#health
    'infrasingularity': 'https://infra-is-ui.vercel.app?utm_source=jsinfo', // https://info.lavanet.xyz/provider/lava@1rzmky2xqdusw8wr0fqplfs7qqudxj7al4zhg0l#health
    // 'SGTstake': 'https://sgtstake.com/', 
    // '01node': 'https://x.com/01node',
    // 'nodes.guru': 'https://nodes.guru/', 
    // 'ChainLayer': 'https://x.com/chainlayerio', 
    // 'Stake Village': 'https://stakevillage.net/en/',
    // 'itrocket': 'https://itrocket.net/',
    // 'CryptoSailors🐬': 'https://x.com/crypto_sailors',
    // 'All That Node': 'https://www.allthatnode.com/',
    // 'Brightlystake': 'https://x.com/brightlystake?lang=en',
    // 'Nodefleet.org': 'https://nodefleet.org/',
    // 'cryptonode.tools': 'https://cryptonode.tools/', 
};

const ProviderMoniker: React.FC<ProviderMonikerProps> = ({ moniker }) => {
    const url = monikerUrls[moniker];
    if (url) {
        return (
            <Link href={url} target="_blank" rel="noopener noreferrer">
                {moniker}
            </Link>
        );
    } else {
        return <>{moniker}</>;
    }
};

export default ProviderMoniker;