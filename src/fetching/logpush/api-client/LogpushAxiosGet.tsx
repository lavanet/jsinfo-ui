
import axios from 'axios';
import axiosRetry from 'axios-retry';
import NodeCache from 'node-cache';
import { GetAxiosCacheTTL, GetAxiosCacheTimeout, GetAxiosRetryCount, GetLogpushUrl } from '@jsinfo/lib/env';

const AXIOS_TIMEOUT = GetAxiosCacheTimeout();

const axiosInstance = axios.create({
    baseURL: GetLogpushUrl(),
});

axiosRetry(axiosInstance, { retries: GetAxiosRetryCount() });

const cache = new NodeCache({ stdTTL: GetAxiosCacheTTL() });
const fetchPromises = new Map();

export interface AxiosApiResponse {
    data: any;
    status: number;
    statusText: string;
}

export async function LogpushAxiosGet(apiurl: string, params?: any, timeout: number = AXIOS_TIMEOUT): Promise<AxiosApiResponse> {
    const cacheKey = `${apiurl}-${JSON.stringify(params)}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
        return cachedResponse as AxiosApiResponse;
    } else {
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
