// src/components/modern/LastUpdateBadge.tsx

import React from 'react';
import { Badge } from '@jsinfo/components/shadcn/ui/Badge';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import ModernTooltip from './ModernTooltip';

interface BlockData {
    height: number;
    datetime: number;
    serverTime?: number;
}

const LastUpdateBadge = () => {
    const { data: blockData, isLoading } = useJsinfobeFetch("indexLatestBlock");

    const formatLastUpdate = (blockTime: Date, serverTime: Date) => {
        const diff = Math.floor((serverTime.getTime() - blockTime.getTime()) / 60000);
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
                {isLoading || !blockData || !blockData.serverTime ? (
                    <>
                        <span className="last-update-badge-update-text">Last update</span>
                        <span className="last-update-badge-time-text">Loading...</span>
                    </>
                ) : (
                    formatLastUpdate(
                        new Date(blockData.datetime),
                        new Date(blockData.serverTime || Date.now())
                    )
                )}
            </Badge>
        </ModernTooltip>
    );
};

export default LastUpdateBadge;
