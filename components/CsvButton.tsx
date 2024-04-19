// jsinfo-ui/components/CsvButton.tsx

import React from 'react';
import { GetRestUrl } from '../src/utils';

const CsvButton = ({ value, csvDownloadLink, children }) => {
    const restUrl = GetRestUrl();
    if (!restUrl) {
        return <div>Error: REST URL is empty</div>;
    }
    const separator = restUrl.endsWith('/') || csvDownloadLink.startsWith('/') ? '' : '/';
    return (
        <>
            <div>
                {children}
            </div>
            <a
                href={`${restUrl}${separator}${csvDownloadLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hide-on-mobile"
            >
                <img
                    width="40"
                    height="40"
                    src="/file-csv-thin.svg"
                    alt="export-csv"
                    style={{ marginTop: '5px' }}
                />
            </a >
        </>
    );
};

export default CsvButton;