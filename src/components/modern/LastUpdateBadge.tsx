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
        try {
            const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
            const data: TimeResponse = await response.json();
            return new Date(data.utc_datetime);
        } catch (error) {
            console.error('Error fetching UTC time:', error);
            return new Date(); // Fallback to local system time
        }
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