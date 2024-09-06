// src/components/SpecProviderHealthSummary.tsx

import React, { CSSProperties } from 'react';
interface SpecProviderHealthSummaryProps {
    healthy: number;
    unhealthy: number;
    style?: CSSProperties;
}

const SpecProviderHealthSummary: React.FC<SpecProviderHealthSummaryProps> = ({ healthy, unhealthy, style }) => {

    const any_true = healthy > 0 || unhealthy > 0;

    return (
        <span style={{ whiteSpace: 'nowrap', ...style }}>
            {healthy > 0 && (
                <>
                    <img
                        width={10}
                        height={10}
                        src={"/circle-green.svg"}
                        alt="Healthy"
                        style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '2px' }}
                    />
                    &nbsp;{healthy}
                </>
            )}
            {unhealthy > 0 && (
                <>
                    {healthy > 0 && <>&nbsp;</>}
                    <img
                        width={10}
                        height={10}
                        src={"/circle-red.svg"}
                        alt="Unhealthy"
                        style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '2px' }}
                    />
                    &nbsp;{unhealthy}
                </>
            )}
        </span>
    );
};

export default SpecProviderHealthSummary;