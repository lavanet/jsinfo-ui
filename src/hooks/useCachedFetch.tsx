// hooks/useCachedFetch.js

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GetRestUrl } from '../utils.js';

const axiosInstance = axios.create({
    baseURL: GetRestUrl(),
});

axiosRetry(axiosInstance, { retries: 5 });

type FetchState = {
    apiurl: string,
    retryTimeout: React.MutableRefObject<number>,
    retryCount: React.MutableRefObject<number>,
    errorCount: React.MutableRefObject<number>,
    isFetching: React.MutableRefObject<boolean>,
    wasOneFetchDone: React.MutableRefObject<boolean>,
    dataLastUpdatedDate: React.MutableRefObject<Date | null>,
    setData: React.Dispatch<React.SetStateAction<any>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
};

const handleEmptyData = async (state: FetchState): Promise<void> => {
    if (state.wasOneFetchDone.current) return;
    if (state.retryCount.current < 50) {
        setTimeout(() => fetchDataWithRetry(state), state.retryTimeout.current);
        state.retryTimeout.current += 100;
        state.retryCount.current += 1;
    } else {
        state.setError('Request timed out');
        state.setLoading(false);
    }
};

const handleData = async (data: any, state: FetchState): Promise<void> => {
    state.wasOneFetchDone.current = true;
    state.setData(data);
    state.setLoading(false);
    state.dataLastUpdatedDate.current = await getLastUpdatedDate(state.apiurl);
    console.log(`data loaded for ${state.apiurl}`);
};

const handleError = async (error: Error, state: FetchState): Promise<void> => {
    if (state.wasOneFetchDone.current) return;
    state.setError(error.message);
    state.setLoading(false);
};

const fetchDataWithRetry = async (state: FetchState): Promise<void> => {
    try {
        if (state.isFetching.current) return;
        state.isFetching.current = true;

        const res = await axiosInstance.get(state.apiurl, { timeout: 3000 });
        const data = res.data;
        state.isFetching.current = false;

        if (data && data.error) {
            state.setError(data.error);
            state.setLoading(false);
        } else if (!data || Object.keys(data).length === 0) {
            await handleEmptyData(state);
        } else {
            await handleData(data, state);
        }

    } catch (error: any) {

        state.isFetching.current = false;

        if (error?.code === 'ECONNABORTED' || (error + "").includes('timeout')) {
            await handleEmptyData(state);
        } else {
            state.errorCount.current++;
            if (state.errorCount.current <= 5) {
                await handleEmptyData(state);
            } else {
                await handleError(error, state);
            }
        }
    }
};

async function getLastUpdatedDate(apiUrl: string): Promise<Date | null> {
    const response = await axiosInstance.get("last-updated/" + apiUrl);
    const lastUpdated = response.data && response.data['X-Data-Last-Updated'];

    if (!lastUpdated) {
        console.log('No last updated date, returning null');
        return null;
    }

    const lastUpdatedDate = new Date(lastUpdated);
    console.log('Last updated:', lastUpdatedDate);
    return lastUpdatedDate;
}

export function useCachedFetch({ dataKey, useLastUrlPathInKey = false }: { dataKey: string, useLastUrlPathInKey?: boolean }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeout = useRef<number>(1000);
    const retryCount = useRef<number>(0);
    const errorCount = useRef<number>(0);
    const isFetching = useRef<boolean>(false);
    const wasOneFetchDone = useRef<boolean>(false);
    const dataLastUpdatedDate = useRef<Date | null>(null);

    const state: FetchState = {
        apiurl: dataKey,
        retryTimeout: retryTimeout,
        retryCount: retryCount,
        errorCount: errorCount,
        isFetching: isFetching,
        wasOneFetchDone: wasOneFetchDone,
        dataLastUpdatedDate: dataLastUpdatedDate,
        setData: setData,
        setLoading: setLoading,
        setError: setError,
    };

    const fetchDataWithRetryWrapper = useCallback(() => {
        fetchDataWithRetry(state);
    }, [fetchDataWithRetry, state]);

    useEffect(() => {
        // Ensure we're in the client 
        if (typeof window === 'undefined') return;

        state.apiurl = dataKey;
        if (useLastUrlPathInKey) {
            const apiKey = window.location.pathname.split('/').pop() || '';
            state.apiurl += "/" + apiKey;
        }

        fetchDataWithRetryWrapper();

        const intervalId = setInterval(async () => {
            if (!state.wasOneFetchDone.current || state.dataLastUpdatedDate.current == null) {
                return;
            }
            try {
                const lastUpdated = await getLastUpdatedDate(state.apiurl);
        
                if (!lastUpdated) {
                    if (intervalId) clearInterval(intervalId);
                    return;
                }
        
                if (lastUpdated > state.dataLastUpdatedDate.current) {
                    console.log('Backgroun fetch:: New data available, fetching');
                    fetchDataWithRetryWrapper();
                }       
            } catch (error) {
                console.error("Backgroun fetch error::", error);
                if (intervalId) clearInterval(intervalId);
            }
        }, 60000); // 60000 milliseconds = 1 minute

        // Clear the interval when the component is unmounted
        return () => clearInterval(intervalId);

    }, [dataKey, fetchDataWithRetry]);

    return { data, loading, error };
}
