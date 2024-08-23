// src/hooks/axios.tsx

import axios from 'axios';
import axiosRetry from 'axios-retry';
import NodeCache from 'node-cache';
import { GetAxiosCacheTTL, GetAxiosCacheTimeout, GetAxiosRetryCount, GetRestUrl } from '@jsinfo/common/env';

const AXIOS_TIMEOUT = GetAxiosCacheTimeout();

const axiosInstance = axios.create({
    baseURL: GetRestUrl(),
});

axiosRetry(axiosInstance, { retries: GetAxiosRetryCount() });

const cache = new NodeCache({ stdTTL: GetAxiosCacheTTL() });
const fetchPromises = new Map();

interface AxiosApiResponse {
    data: any;
    status: number;
    statusText: string;
}

export async function AxiosApiGet(apiurl: string, params?: any, timeout: number = AXIOS_TIMEOUT): Promise<AxiosApiResponse> {
    const cacheKey = `${apiurl}-${JSON.stringify(params)}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
        return cachedResponse as AxiosApiResponse;
    } else {
        // Check if there's an ongoing fetch for the same request
        if (fetchPromises.has(cacheKey)) {
            return fetchPromises.get(cacheKey);
        }

        const fetchPromise = axiosInstance.get(apiurl, {
            timeout: timeout,
            params,
        }).then(response => {
            const responseData = {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
            cache.set(cacheKey, responseData);
            fetchPromises.delete(cacheKey);
            return responseData;
        }).catch(error => {
            fetchPromises.delete(cacheKey);
            throw error;
        });

        fetchPromises.set(cacheKey, fetchPromise);

        return fetchPromise;
    }
}
