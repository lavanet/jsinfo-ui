// src/components/modern/ModernTooltip.tsx

import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import React from 'react';

interface ModernTooltipProps {
    title?: string | ((data: any) => string);
    content?: React.ReactNode;
    children: React.ReactNode;
    isHtml?: boolean;
    data?: any;
}

const ModernTooltip: React.FC<ModernTooltipProps> = ({ title, content, children, isHtml = false, data }) => {
    if (!title && !content) {
        return <>{children}</>;
    }

    // Handle function title
    let tooltipTitle: string | undefined = undefined;
    if (typeof title === 'function' && data) {
        tooltipTitle = title(data);
    } else if (typeof title === 'string') {
        tooltipTitle = title;
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <span style={{ textAlign: 'left' }} >{children}</span>
            </TooltipTrigger>
            <TooltipContent sideOffset={5} className="modern-tool-tip-content z-[1000]">
                {content ? (
                    content
                ) : isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: tooltipTitle || '' }} />
                ) : (
                    tooltipTitle && tooltipTitle.split('\n').map((line, index, array) => (
                        <React.Fragment key={index}>
                            {line}
                            {index < array.length - 1 && <br />}
                        </React.Fragment>
                    ))
                )}
            </TooltipContent>
        </Tooltip>
    );
};

export default ModernTooltip;