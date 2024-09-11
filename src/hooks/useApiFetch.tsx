// hooks/useApiFetch.tsx
"use client";

import { useEffect } from 'react';
import { ValidateDataKey } from './utils';
import { AxiosDataLoader } from '../fetching/AxiosDataLoader';

export function useApiFetch(dataKey: string) {
    ValidateDataKey(dataKey);

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, null);

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    return { data, loading, error };
}

