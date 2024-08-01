// src/app/provider/[lavaid]/_components/ProviderAccountInfoTab.tsx

import React, { useEffect, useState } from 'react';
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import LoadingIndicator from '@jsinfo/components/LoadingIndicator';
import { RenderInFullPageCard } from '@jsinfo/common/utils';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import ReactJson from 'react-json-view';
import { AxiosDataLoader } from '@jsinfo/hooks/AxiosDataLoader';
import Image from 'next/image';
import { Tabs } from '@radix-ui/themes';

const AccountInfoCard: React.FC<{ addr: string }> = ({ addr }) => {
    // console.log("AccountInfoCard Rendered", { addr });

    const [idx, setIdx] = useState(0);
    const [maxIdx, setMaxIdx] = useState(0);
    const dataKey = `providerAccountInfo/${addr}?idx=${idx}`;

    // console.log("State values", { idx, maxIdx, dataKey });

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, null);

    // console.log("AxiosDataLoader initialized", { dataKey, data, loading, error });

    useEffect(() => {
        // console.log("AccountInfoCard useEffect for idx", idx);
        fetcher.SetApiUrl(`providerAccountInfo/${addr}?idx=${idx}`);
        fetcher.FetchAndPopulateData();
    }, [addr, idx]);

    let content = null;
    let json = null;

    useEffect(() => {
        // console.log("AccountInfoCard useEffect for data change", data);
        if (data && data.itemCount) {
            // console.log("Setting maxIdx", data.itemCount - 1);
            setMaxIdx(data.itemCount - 1);
        }
    }, [data]);

    if (error) {
        // console.log("Error state", error);
        content = <ErrorDisplay message={error} />;
    } else if (loading) {
        // console.log("Loading state", { addr });
        content = <LoadingIndicator loadingText={`Loading ${addr} account info`} greyText={`${addr}`} />;
    } else if (!data.data) {
        // console.log("Data is empty");
        content = <ErrorDisplay message={"data is empty"} />;
    } else {
        try {
            console.log("Attempting to parse JSON", data.data.data);
            json = JSON.parse(data.data.data!);
        } catch (error) {
            console.log("Error parsing JSON", error, "json:", data.data);
            content = <ErrorDisplay message={"Error parsing JSON"} />;
        }
    }

    if (content) {
        // console.log("Rendering content", content);
        return RenderInFullPageCard(content);
    }

    if (!json) {
        // console.log("Json is empty");
        return RenderInFullPageCard(<ErrorDisplay message={"Json is empty"} />);
    }

    const handlePrevClick = () => {
        // console.log("Prev button clicked", { currentIdx: idx });
        setIdx(Math.max(0, idx - 1));
    };

    const handleNextClick = () => {
        // console.log("Next button clicked", { currentIdx: idx });
        setIdx(Math.min(idx + 1, maxIdx));
    };


    const formatDateForDownload = () => {
        const date = new Date(data.data.timestamp);
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const ret = `${year}${month}${day}_${hours}${minutes}_utc`;
        return `LavaAccountInfo_${addr}_${ret}.json`
    };

    return (
        <div className='accountinfocard_container'>
            <div className="accountinfocard_leftrightbuttons">
                <button
                    onClick={handlePrevClick}
                    disabled={idx === 0}
                    style={{
                        color: idx === 0 ? '#999' : '#000',
                        backgroundColor: idx === 0 ? 'transparent' : ''
                    }}
                >&lt;</button>
                <button
                    onClick={handleNextClick}
                    disabled={idx === maxIdx}
                    style={{
                        color: idx === maxIdx ? '#999' : '#000',
                        backgroundColor: idx === maxIdx ? 'transparent' : ''
                    }}
                >&gt;</button>
                {(idx || maxIdx) && (
                    <span className='accountinfocard_pagecounter'>
                        Item {idx + 1} of {maxIdx + 1}
                    </span>
                )}
                <span className='accountinfocard_floatright'>
                    {data.data.timestamp && (
                        <>
                            <TimeTooltip datetime={data.data.timestamp} />
                            <span style={{ marginLeft: '20px' }}></span>
                        </>
                    )}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = formatDateForDownload();
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                    >
                        <Image
                            width={31}
                            height={31}
                            src="/download-json.svg"
                            alt="download-json"
                            style={{ display: 'inline-block', verticalAlign: 'middle', margin: '-4px', paddingBottom: '2px', marginRight: '2px' }}
                        />
                        Download JSON
                    </a>
                    <span style={{ marginLeft: '20px' }}></span>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(JSON.stringify(json, null, 2))
                                .then(() => alert('JSON copied to clipboard!'))
                                .catch(err => console.error('Error copying JSON to clipboard', err));
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                    >
                        <Image
                            width={37}
                            height={37}
                            src="/copy.svg"
                            alt="copy-json"
                            style={{ display: 'inline-block', verticalAlign: 'middle', margin: '-4px', paddingBottom: '2px', marginRight: '-2px' }}
                        />
                        Copy to Clipboard
                    </a>
                </span>
            </div>
            <div style={{ marginTop: '6px' }}></div>
            <div className='accountinfocard_jsoncontainer'>
                <ReactJson src={json} theme="summerfruit" displayDataTypes={false} collapsed={1} />
            </div>
        </div>
    );
};

interface ProviderAccountInfoTabProps {
    addr: string;
}

const ProviderAccountInfoTab: React.FC<ProviderAccountInfoTabProps> = ({ addr }) => {
    return (
        <Tabs.Content value={"accountInfo"}>
            <AccountInfoCard addr={addr} />
        </Tabs.Content>
    )
}
export default ProviderAccountInfoTab;
