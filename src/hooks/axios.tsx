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

export async function AxiosApiGet(apiurl: string, params?: any, timeout: number = AXIOS_TIMEOUT): Promise<any> {
    const cacheKey = `${apiurl}-${JSON.stringify(params)}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    } else {
        const response = await axiosInstance.get(apiurl, {
            timeout: timeout,
            params,
        });

        const responseData = {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };

        cache.set(cacheKey, responseData);

        return responseData;
    }
}
