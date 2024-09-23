"use client";

import { useEffect } from 'react';
import { LogpushDataFetcher } from '../api-client/LogpushDataFetcher';

export function useLogpushFetch(dataKey: string) {
    const { fetcher, data, loading, error } = LogpushDataFetcher.initialize(dataKey, null, null);

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    return { data, loading, error };
}


