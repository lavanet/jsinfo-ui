// jsinfo-ui/components/CsvButtonTabTrigger.tsx

import React from 'react';
import { Tabs } from "@radix-ui/themes";
import { GetRestUrl } from '../src/utils';

const CsvButtonTabTrigger = ({ value, csvDownloadLink, children }) => {
    const restUrl = GetRestUrl();
    if (!restUrl) {
        return <div>Error: REST URL is empty</div>;
    }
    const separator = restUrl.endsWith('/') || csvDownloadLink.startsWith('/') ? '' : '/';
    return (
        <Tabs.Trigger value={value}>
            {children}
            <a
                href={`${restUrl}${separator}${csvDownloadLink}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    width="40"
                    height="40"
                    src="/file-csv-thin.svg"
                    alt="export-csv"
                    style={{ paddingTop: "5px" }}
                />
            </a>
        </Tabs.Trigger>
    );
};

export default CsvButtonTabTrigger;