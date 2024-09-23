// LavaLogoLink.tsx

import React from 'react';
import Link from 'next/link';
import { GetLogoUrl } from '@jsinfo/lib/env';

const LavaLogoLink = () => {
    return (
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <img src={GetLogoUrl()} alt="Lava Logo" className="lava-logo-image" />
            <span className="sr-only">Lava</span>
        </Link>
    );
};

export default LavaLogoLink;