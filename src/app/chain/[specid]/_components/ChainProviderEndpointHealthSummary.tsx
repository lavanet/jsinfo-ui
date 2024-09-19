// src/components/SpecProviderEndpointHealthSummary.tsx

import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import React, { CSSProperties } from 'react';

interface SpecProviderEndpointHealthSummaryProps {
    provider: string;
    spec: string;
    style?: CSSProperties;
}

const SpecProviderEndpointHealthSummary: React.FC<SpecProviderEndpointHealthSummaryProps> = ({ provider, spec, style }) => {

    const { data, loading, error } = useJsinfobeFetch(`specProviderHealth/${spec}/${provider}`);

    if (error) return null;
    if (loading) return null;

    if (!data || !data.data || (!data.data.healthy && !data.data.unhealthy)) {
        return null;
    }

    const { healthy, unhealthy } = data.data;

    const any_true = healthy > 0 || unhealthy > 0;

    return (
        <span style={{ whiteSpace: 'nowrap', ...style }}>
            {any_true && <> , </>}
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

export default SpecProviderEndpointHealthSummary;