// src/components/TableCsvButton.tsx

// TODO: write csv report next to the download icon

import React from 'react';
import Image from 'next/image';
import { GetRestUrl } from '@jsinfo/lib/env';

interface TableCsvButtonProps {
    csvDownloadLink: string;
}

const TableCsvButton: React.FC<TableCsvButtonProps> = ({ csvDownloadLink }) => {
    const restUrl = GetRestUrl();
    if (!restUrl) {
        return <div>Error: REST URL is empty</div>;
    }
    const separator = restUrl.endsWith('/') || csvDownloadLink.startsWith('/') ? '' : '/';
    return (
        <span style={{ marginLeft: '10px', padding: '0', float: 'right', margin: '-10px', marginBottom: '-30px' }}>
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
        </span >
    );
};

export default TableCsvButton;