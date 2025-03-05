// src/components/modern/ModernTooltip.tsx

import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import React from 'react';
interface ModernTooltipProps {
    title?: string;
    content?: React.ReactNode;
    children: React.ReactNode;
    isHtml?: boolean;
}

const ModernTooltip: React.FC<ModernTooltipProps> = ({ title, content, children, isHtml = false }) => {
    if (!title && !content) {
        return <>{children}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <span style={{ textAlign: 'left' }} >{children}</span>
            </TooltipTrigger>
            <TooltipContent className="modern-tool-tip-content">
                {content ? (
                    content
                ) : isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: title! }} />
                ) : (
                    title!.split('\n').map((line, index, array) => (
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