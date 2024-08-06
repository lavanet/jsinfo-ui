"use client"

import React, { useEffect, useState } from 'react';
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import LoadingIndicator from '@jsinfo/components/LoadingIndicator';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import ReactJson from 'react-json-view';
import { AxiosDataLoader } from '@jsinfo/hooks/AxiosDataLoader';
import Image from 'next/image';

const ErrorComponent: React.FC<{ message: string }> = ({ message }) => {
    return <div style={{ padding: '1em', textAlign: 'center' }}><ErrorDisplay message={message} /></div>;
};

const LoadingComponent: React.FC<{ loadingText: string; greyText: string }> = ({ loadingText, greyText }) => {
    return <LoadingIndicator loadingText={loadingText} greyText={greyText} />;
};

const NoDataAvailableComponent: React.FC<{}> = () => {
    return (
        <div style={{ padding: '1em', textAlign: 'center' }}>
            <h2>No <span style={{ fontWeight: 'bold', color: 'grey' }}>Account Info</span> data available</h2>
        </div>
    );
};

const NavigationButtons: React.FC<{ idx: number; maxIdx: number; onPrevClick: () => void; onNextClick: () => void, json: string, timestamp: string, addr: string }> = ({ idx, maxIdx, onPrevClick, onNextClick, json, timestamp, addr }) => {
    if (maxIdx <= 1) {
        return (
            <div className='accountinfocard_pagecounter' style={{ marginBottom: '12px' }}>
                <span style={{ marginTop: '5px', display: "inline-block" }}>Item 1 of 1</span>
                <AccountInfoActions json={json} timestamp={timestamp} addr={addr} />
            </div>
        )
    }
    return (
        <div className="accountinfocard_leftrightbuttons">
            <span>
                <button
                    onClick={onPrevClick}
                    disabled={idx === 0}
                    style={{
                        color: idx === 0 ? '#999' : '#000',
                        backgroundColor: idx === 0 ? 'transparent' : ''
                    }}
                >&lt;</button>
                <button
                    onClick={onNextClick}
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
            </span>
            <AccountInfoActions json={json} timestamp={timestamp} addr={addr} />
        </div>
    );
};

const AccountInfoActions: React.FC<{ json: any; timestamp: string; addr: string }> = ({ json, timestamp, addr }) => {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    useEffect(() => {
        if (downloadUrl) {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = formatDateForDownload();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
    }, [downloadUrl]);

    const formatDateForDownload = () => {
        const date = new Date(timestamp);
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const ret = `${year}${month}${day}_${hours}${minutes}_utc`;
        return `LavaAccountInfo_${addr}_${ret}.json`
    };

    return (
        <span className='accountinfocard_floatright'>
            {timestamp && (
                <>
                    <TimeTooltip datetime={timestamp} />
                    <span style={{ marginLeft: '20px' }}></span>
                </>
            )}
            <a
                href="#"
                onClick={(e) => {
                    if (typeof window === 'undefined') return;
                    e.preventDefault();
                    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);
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
    );
};

const JsonDisplay: React.FC<{ json: any }> = ({ json }) => {
    return (
        <div className='accountinfocard_jsoncontainer'>
            <ReactJson src={json} theme="summerfruit" displayDataTypes={false} collapsed={1} />
        </div>
    );
};

const ProviderAccountInfoCard: React.FC<{ addr: string }> = ({ addr }) => {
    const [idx, setIdx] = useState(0);
    const [maxIdx, setMaxIdx] = useState(0);
    const dataKey = `providerAccountsInfo/${addr}?idx=${idx}`;

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, null);

    useEffect(() => {
        fetcher.SetApiUrl(`providerAccountInfo/${addr}?idx=${idx}`);
        fetcher.FetchAndPopulateData();
    }, [addr, idx]);

    useEffect(() => {
        if (data && data.itemCount) {
            setMaxIdx(data.itemCount - 1);
        }
    }, [data]);

    let json = null;

    if (error) {
        return <ErrorComponent message={error} />;
    } else if (loading) {
        return <LoadingComponent loadingText={`Loading ${addr} account info`} greyText={`${addr}`} />;
    } else if (!data.data || data.itemCount === 0) {
        return <NoDataAvailableComponent />;
    } else {
        try {
            console.log("Attempting to parse JSON", data.data.data);
            json = JSON.parse(data.data.data!);
        } catch (error) {
            console.log("Error parsing JSON", error, "json:", data.data);
            return <ErrorComponent message={"Error parsing JSON"} />;
        }
    }

    if (!json) {
        return <ErrorComponent message={"Json is empty"} />;
    }

    const handlePrevClick = () => {
        setIdx(Math.max(0, idx - 1));
    };

    const handleNextClick = () => {
        setIdx(Math.min(idx + 1, maxIdx));
    };

    return (
        <div className='accountinfocard_container'>
            <NavigationButtons idx={idx} maxIdx={maxIdx} onPrevClick={handlePrevClick} onNextClick={handleNextClick} json={json} timestamp={data.data.timestamp} addr={addr} />
            <JsonDisplay json={json} />
        </div>
    );
};

export default ProviderAccountInfoCard;
