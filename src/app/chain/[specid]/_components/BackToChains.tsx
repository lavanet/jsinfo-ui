// src/app/chain/[specid]/_components/BackToChains.tsx

import React from 'react';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-feather';

const BackToSpecsLink: React.FC = () => {
    return (
        <Link href="/chains" passHref>
            <Button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chains
            </Button>
        </Link>
    );
};

export default BackToSpecsLink;