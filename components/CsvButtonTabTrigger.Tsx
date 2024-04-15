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
                    width="20"
                    height="20"
                    src="https://img.icons8.com/ios-filled/20/D3580C/export-csv.png"
                    alt="export-csv"
                    style={{ paddingLeft: "10px", paddingTop: "5px" }}
                />
            </a>
        </Tabs.Trigger>
    );
};

export default CsvButtonTabTrigger;