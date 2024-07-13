// src/components/CsvButton.tsx

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { GetRestUrl } from '@jsinfo/common/env';

interface CsvButtonProps {
    csvDownloadLink: string;
    children?: ReactNode | null;
}

const CsvButton: React.FC<CsvButtonProps> = ({ csvDownloadLink, children }) => {
    const restUrl = GetRestUrl();
    if (!restUrl) {
        return <div>Error: REST URL is empty</div>;
    }
    const separator = restUrl.endsWith('/') || csvDownloadLink.startsWith('/') ? '' : '/';
    return (
        <>
            {children && (
                <div>
                    {children}
                </div>
            )}
            <a
                href={`${restUrl}${separator}${csvDownloadLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hide-on-mobile"
            >
                <Image
                    width={40}
                    height={40}
                    src="/file-csv-thin.svg"
                    alt="export-csv"
                />
            </a >
        </>
    );
};

export default CsvButton;