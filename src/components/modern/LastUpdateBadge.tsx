// src/components/modern/LastUpdateBadge.tsx

import React, { useState, useEffect } from 'react';
import { Badge } from '@jsinfo/components/shadcn/ui/Badge';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import ModernTooltip from './ModernTooltip';

interface BlockData {
    height: number;
    datetime: number;
}

interface TimeResponse {
    datetime: string;
    utc_datetime: string;
}

const LastUpdateBadge = () => {
    const { data, loading } = useJsinfobeFetch("indexLatestBlock");
    const blockData = data as BlockData;
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    async function getUTCTime(): Promise<Date> {
        const isHttps = window.location.protocol === 'https:';
        const urls = isHttps
            ? ['https://worldtimeapi.org/api/timezone/Etc/UTC', 'http://worldtimeapi.org/api/timezone/Etc/UTC']
            : ['http://worldtimeapi.org/api/timezone/Etc/UTC', 'https://worldtimeapi.org/api/timezone/Etc/UTC'];

        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: TimeResponse = await response.json();
                return new Date(data.utc_datetime);
            } catch (error) {
                console.error(`Error fetching UTC time from ${url}:`, error);
                // If this is the last URL, throw the error
                if (url === urls[urls.length - 1]) {
                    throw error;
                }
                // Otherwise, continue to the next URL
            }
        }

        // If all attempts fail, fall back to local system time
        console.warn('All attempts to fetch UTC time failed. Falling back to local system time.');
        return new Date();
    }

    useEffect(() => {
        getUTCTime().then(setCurrentTime);
        const interval = setInterval(() => {
            getUTCTime().then(setCurrentTime);
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const formatLastUpdate = (blockTime: Date, currentTime: Date) => {
        const diff = Math.floor((currentTime.getTime() - blockTime.getTime()) / 60000);
        return (
            <>
                <span className="last-update-badge-update-text">Last update</span>
                <span className="last-update-badge-time-text">{`${diff} minute${diff !== 1 ? 's' : ''} ago`}</span>
            </>
        );
    };

    return (
        <ModernTooltip title={`Latest block height: ${blockData ? blockData.height : 'Loading...'}`}>
            <Badge variant="outline" className="last-update-badge-content">
                {loading || !blockData || !currentTime ? (
                    <>
                        <span className="last-update-badge-update-text">Last update</span>
                        <span className="last-update-badge-time-text">Loading...</span>
                    </>
                ) : (
                    formatLastUpdate(new Date(blockData.datetime), currentTime)
                )}
            </Badge>
        </ModernTooltip>
    );
};

export default LastUpdateBadge;