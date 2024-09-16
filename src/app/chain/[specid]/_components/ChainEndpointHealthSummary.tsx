// src/app/chain/[specid]/_components/ChainEndpointHealthSummary.tsx

import React, { CSSProperties } from 'react';
interface ChainProviderHealthSummaryProps {
    healthy: number;
    unhealthy: number;
    style?: CSSProperties;
}

const ChainProviderHealthSummary: React.FC<ChainProviderHealthSummaryProps> = ({ healthy, unhealthy, style }) => {

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

export default ChainProviderHealthSummary;