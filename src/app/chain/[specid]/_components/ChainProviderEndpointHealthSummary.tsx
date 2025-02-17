// src/components/SpecProviderEndpointHealthSummary.tsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { GetJsinfobeUrl } from '@jsinfo/lib/env';
import React, { CSSProperties } from 'react';

interface SpecProviderEndpointHealthSummaryProps {
    provider: string;
    spec: string;
    style?: CSSProperties;
}

const SpecProviderEndpointHealthSummary: React.FC<SpecProviderEndpointHealthSummaryProps> = ({ provider, spec, style }) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${GetJsinfobeUrl()}/specProviderHealth/${spec}/${provider}`,
                    { signal: controller.signal }
                );

                if (isMounted) {
                    if (response.data?.error === "Provider does not exist on specProviderHealth") {
                        setError(response.data);
                        setData(null);
                    } else {
                        setData(response.data);
                        setError(null);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                    setData(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [spec, provider]);

    if (error) return null;
    if (isLoading) return null;

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