// src/components/modern/LastUpdateBadge.tsx

import React from 'react';
import { Badge } from '@jsinfo/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { useApiFetch } from '@jsinfo/hooks/useApiFetch';

interface BlockData {
    height: number;
    datetime: number;
}

const LastUpdateBadge = () => {
    const { data, loading } = useApiFetch("indexLatestBlock");
    const blockData = data as BlockData;

    const formatLastUpdate = (date: Date) => {
        const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
        return (
            <>
                <span className="last-update-badge-update-text">Last update</span>
                <span className="last-update-badge-time-text">{`${diff} minute${diff !== 1 ? 's' : ''} ago`}</span>
            </>
        );
    };

    return (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant="outline" className="last-update-badge-content">
                    {loading || !blockData ? (
                        <>
                            <span className="last-update-badge-update-text">Last update</span>
                            <span className="last-update-badge-time-text">1 min ago</span>
                        </>
                    ) : (
                        formatLastUpdate(new Date(blockData.datetime))
                    )}
                </Badge>
            </TooltipTrigger>
            <TooltipContent className="last-update-badge-no-wrap">
                {`Latest block height: ${blockData ? blockData.height : 'Loading...'}`}
            </TooltipContent>
        </Tooltip>
    );
};

export default LastUpdateBadge;