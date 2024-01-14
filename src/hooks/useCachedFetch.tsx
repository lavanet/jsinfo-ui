// hooks/useCachedFetch.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GetRestUrl } from '../utils.js';

const axiosInstance = axios.create({
    baseURL: GetRestUrl(),
});

axiosRetry(axiosInstance, { retries: 5 });

const handleEmptyData = (retryCount, retryTimeout, fetchDataWithRetry, setError, setLoading) => {
    if (retryCount.current < 20) {
        // If data is an empty object, retry after retryTimeout milliseconds
        setTimeout(fetchDataWithRetry, retryTimeout.current);
        // Increase the retry timeout by 1 second for the next potential retry
        retryTimeout.current += 500;
        // Increment retryCount
        retryCount.current += 1;
    } else { 
        setError('Request timed out'); // Set error message to "Request timed out"
        setLoading(false);
    }
};

const handleData = (data, setData, setLoading) => {
    setData(data);
    setLoading(false);
};

const handleError = (error, setError, setLoading) => {
    setError(error.message);
    setLoading(false);
};

const fetchDataWithRetry = async (apiUrl, setData, setLoading, setError, retryCount, retryTimeout) => {
    try {
        const res = await axiosInstance.get( apiUrl, { timeout: 3000 }); // 3 seconds timeout
        const data = res.data;

        if (data && data.error) {
            setError(data.error);
            setLoading(false);
        } else if (!data || Object.keys(data).length === 0) {
            handleEmptyData(retryCount, retryTimeout, () => fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout), setError, setLoading);
        } else {
            handleData(data, setData, setLoading);
        }
    } catch (error) {
        if (error?.code === 'ECONNABORTED' || (error + "").includes('timeout')) { // If error is a timeout error
            handleEmptyData(retryCount, retryTimeout, () => fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout), setError, setLoading);
        } else {
            handleError(error, setError, setLoading);
        }
    }
};

export function useCachedFetchWithUrlKey(dataKey) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const retryTimeout = useRef(1000); // Initial retry timeout is 1 second
    const retryCount = useRef(0); // Use useRef for retryCount

    useEffect(() => {
        // Ensure we're in the client 
        if (typeof window !== 'undefined') {
            const apiKey = window.location.pathname.split('/').pop() || '';
            const apiUrl = dataKey + "/" + apiKey;
            fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout);
        }
    }, [dataKey]);

    return { data, loading, error };
}


export function useCachedFetch(dataKey) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const retryTimeout = useRef(500); // Initial retry timeout is 0.5 seconds
    const retryCount = useRef(0); // Use useRef for retryCount

    useEffect(() => {
        const apiUrl = dataKey;
        fetchDataWithRetry(apiUrl, setData, setLoading, setError, retryCount, retryTimeout);
    }, [dataKey]); 

    return { data, loading, error };
}