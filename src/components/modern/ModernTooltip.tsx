// src/components/modern/ModernTooltip.tsx

import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import React from 'react';
interface ModernTooltipProps {
    title?: string;
    children: React.ReactNode;
}

const ModernTooltip: React.FC<ModernTooltipProps> = ({ title, children }) => {
    if (!title) {
        return <>{children}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <span>{children}</span>
            </TooltipTrigger>
            <TooltipContent className="text-no-wrap">
                {title.split('\n').map((line, index, array) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </TooltipContent>
        </Tooltip>
    );
};

export default ModernTooltip;