// src/components/modern/ChainWithIconLink.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { chainDictionary } from '@jsinfo/lib/chain-assets/chain-icons';

interface ChainWithIconLinkProps {
    chainId: string;
    className?: string;
}

const ChainWithIconLink: React.FC<ChainWithIconLinkProps> = ({ chainId, className = '' }) => {
    const chainIdLower = chainId.toLowerCase();
    const chainInfo = chainDictionary[chainIdLower];

    return (
        <Link className={`flex items-center gap-2 ${className}`} href={`/chain/${chainId}`}>
            {chainInfo && chainInfo.icon && (
                <div className="relative w-5 h-5 flex-shrink-0">
                    <Image
                        src={chainInfo.icon}
                        alt={`${chainInfo.name} icon`}
                        fill
                        sizes="20px"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            )}
            <span>{chainId}</span>
        </Link>
    );
};

export default ChainWithIconLink;