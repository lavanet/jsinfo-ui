// hooks/useCachedFetch.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3 });

const handleEmptyData = (retryCount, retryTimeout, fetchData, setError, setLoading) => {
    if (retryCount.current < 10) { // If retryCount is less than 10
        // If data is an empty object, retry after retryTimeout milliseconds
        setTimeout(fetchData, retryTimeout.current);
        // Increase the retry timeout by 1 second for the next potential retry
        retryTimeout.current += 1000;
        // Increment retryCount
        retryCount.current += 1;
    } else { // If retryCount is 10 or more
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

const fetchData = async (apiUrl, setData, setLoading, setError, retryCount, retryTimeout) => {
    try {
        const res = await axios.get(apiUrl, { timeout: 5000 }); // 5 seconds timeout
        const data = res.data;

        if (!data || Object.keys(data).length === 0) {
            handleEmptyData(retryCount, retryTimeout, () => fetchData(apiUrl, setData, setLoading, setError, retryCount, retryTimeout), setError, setLoading);
        } else {
            handleData(data, setData, setLoading);
        }
    } catch (error) {
        handleError(error, setError, setLoading);
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
            const apiUrl = `/api/cachedFetch?apiUrlPath=${encodeURIComponent(dataKey)}&apiUrlKey=${encodeURIComponent(apiKey)}`;
            fetchData(apiUrl, setData, setLoading, setError, retryCount, retryTimeout);
        }
    }, [dataKey]); // Remove retryTimeout from the dependency array

    return { data, loading, error };
}


export function useCachedFetch(dataKey) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const retryTimeout = useRef(1000); // Initial retry timeout is 1 second
    const retryCount = useRef(0); // Use useRef for retryCount

    useEffect(() => {
        const apiUrl = `/api/cachedFetch?apiUrlPath=${encodeURIComponent(dataKey)}`;
        fetchData(apiUrl, setData, setLoading, setError, retryCount, retryTimeout);
    }, [dataKey]); // Re-run the effect when `dataKey` changes

    return { data, loading, error };
}