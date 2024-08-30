// hooks/useApiDataFetch.tsx
"use client";

import { useEffect } from 'react';
import { ValidateDataKey } from './utils';
import { AxiosDataLoader } from '../fetching/AxiosDataLoader';

interface useApiDataFetchProps {
    dataKey: string;
}

export function useApiDataFetch({
    dataKey,
}: useApiDataFetchProps) {

    ValidateDataKey(dataKey);

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, null);

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    return { data, loading, error };
}

