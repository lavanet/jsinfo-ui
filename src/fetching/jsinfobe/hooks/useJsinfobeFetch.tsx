// hooks/useJsinfobeFetch.tsx
"use client";

import { useEffect } from 'react';
import { ValidateDataKey } from './utils';
import { JsinfobeDataFetcher } from '../api-client/JsinfobeDataFetcher';

export function useJsinfobeFetch(dataKey: string) {
    ValidateDataKey(dataKey);

    const { fetcher, data, loading, error } = JsinfobeDataFetcher.initialize(dataKey, null, null);

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    return { data, loading, error };
}

