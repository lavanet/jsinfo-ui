// hooks/useCachedFetch.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GetRestUrl } from '../utils.js';

const axiosInstance = axios.create({
    baseURL: GetRestUrl(),
});

axiosRetry(axiosInstance, { retries: 5 });

const handleEmptyData = (
    retryCount: React.MutableRefObject<number>, 
    retryTimeout: React.MutableRefObject<number>, 
    fetchDataWithRetry: () => void, 
    setError: React.Dispatch<React.SetStateAction<string | null>>, 
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    // total retry time = 132500 ~ 2 minutes
    if (retryCount.current < 50) {
        // If data is an empty object, retry after retryTimeout milliseconds
        setTimeout(fetchDataWithRetry, retryTimeout.current);
        // Increase the retry timeout by 1 second for the next potential retry
        retryTimeout.current += 100;
        // Increment retryCount
        retryCount.current += 1;
    } else { 
        setError('Request timed out'); // Set error message to "Request timed out"
        setLoading(false);
    }
};

// Assuming data can be of any type
const handleData = (data: any, setData: React.Dispatch<React.SetStateAction<any>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>): void => {
    setData(data);
    setLoading(false);
};

// Assuming error is of type Error
const handleError = (error: Error, setError: React.Dispatch<React.SetStateAction<string | null>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>): void => {
    setError(error.message);
    setLoading(false);
};

const fetchDataWithRetry = async (
  apiUrl: string, 
  setData: React.Dispatch<React.SetStateAction<any>>, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>, 
  setError: React.Dispatch<React.SetStateAction<string | null>>, 
  retryCount: React.MutableRefObject<number>, 
  retryTimeout: React.MutableRefObject<number>, 
  errorCount: React.MutableRefObject<number>
): Promise<void> => {
    try {
        const res = await axiosInstance.get( apiUrl, { timeout: 3000 }); // 3 seconds timeout
        const data = res.data;

        if (data && data.error) {
            setError(data.error);
            setLoading(false);
        } else if (!data || Object.keys(data).length === 0) {
            handleEmptyData(retryCount, retryTimeout, () => fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout, errorCount), setError, setLoading);
        } else {
            handleData(data, setData, setLoading);
        }
    } catch (error: any) {
        if (error?.code === 'ECONNABORTED' || (error + "").includes('timeout')) { // If error is a timeout error
            handleEmptyData(retryCount, retryTimeout, () => fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout, errorCount), setError, setLoading);
        } else {
            errorCount.current++;
            if (errorCount.current <= 2) {
                handleEmptyData(retryCount, retryTimeout, () => fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout, errorCount), setError, setLoading);
            } else {
                handleError(error, setError, setLoading);
            }
        }
    }
};

export function useCachedFetchWithUrlKey(dataKey: string) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeout = useRef<number>(1000); 
    const retryCount = useRef<number>(0);
    const errorCount = useRef<number>(0);

    useEffect(() => {
        // Ensure we're in the client 
        if (typeof window !== 'undefined') {
            const apiKey = window.location.pathname.split('/').pop() || '';
            const apiUrl = dataKey + "/" + apiKey;
            fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout, errorCount);
        }
    }, [dataKey]);

    return { data, loading, error };
}


export function useCachedFetch(dataKey: string) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeout = useRef<number>(1000); 
    const retryCount = useRef<number>(0);
    const errorCount = useRef<number>(0);

    useEffect(() => {
        const apiUrl = dataKey;
        fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout, errorCount);
    }, [dataKey]); 

    return { data, loading, error };
}