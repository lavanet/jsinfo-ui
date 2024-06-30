// hooks/useCachedFetch.tsx
"use client";

// APR 22 2024
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
// This file was working properly before the upgrade from pages to app router
// It was tested on testnet and staging for a month with no issues
// These warnings appeared after the upgrade to app router

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GetRestUrl } from '@jsinfo/common/utils';
import { CachedFetchDateRange, SortAndPaginationConfig } from '@jsinfo/common/types.jsx';

const AXIOS_TIMEOUT = 100000

const axiosInstance = axios.create({
    baseURL: GetRestUrl(),
});

axiosRetry(axiosInstance, { retries: 5 });

type FetchState = {
    apiurl: string | null,
    apiurlPaginationQuery: string | null,
    apiurlDateRangeQuery: CachedFetchDateRange | null,
    retryTimeout: React.MutableRefObject<number>,
    retryCount: React.MutableRefObject<number>,
    errorCount: React.MutableRefObject<number>,
    isFetching: React.MutableRefObject<boolean>,
    wasOneFetchDone: React.MutableRefObject<boolean>,
    setData: React.Dispatch<React.SetStateAction<any>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
};

function isFetchState(state: any): state is FetchState {
    return state
        && typeof state.apiurl === 'string'
        && (state.apiurlPaginationQuery === null || typeof state.apiurlPaginationQuery === 'string')
        && (state.apiurlDateRangeQuery === null || (state.apiurlDateRangeQuery.from || state.apiurlDateRangeQuery.to))
        && typeof state.setData === 'function'
        && typeof state.setLoading === 'function'
        && typeof state.setError === 'function';
}

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
};

const handleError = async (error: Error, state: FetchState): Promise<void> => {
    if (state.wasOneFetchDone.current) return;
    state.setError(error.message);
    state.setLoading(false);
};

const fetchDataWithRetry = async (state: FetchState): Promise<void> => {
    if (!isFetchState(state)) {
        console.error(`fetchDataWithRetry invalid state type. Type: ${typeof state}, Value: ${JSON.stringify(state)}`);
        throw new Error(`fetchDataWithRetry invalid arguments: state=${state}`);
    }

    if (!state.apiurl || state.apiurl === "undefined" || state.apiurl === "null" || state.apiurl === "") {
        console.error(`fetchDataWithRetry invalid arguments: state.apiurl=${state.apiurl}, state=${state}}`);
        throw new Error(`fetchDataWithRetry invalid arguments: state.apiurl=${state.apiurl}`);
    }

    try {

        if (state.isFetching.current) return;
        state.isFetching.current = true;

        let params: any = {};

        if (state.apiurlPaginationQuery) {
            params.pagination = state.apiurlPaginationQuery;
        }

        if (state.apiurlDateRangeQuery) {
            if (state.apiurlDateRangeQuery.from) {
                params.f = state.apiurlDateRangeQuery.from;
            }
            if (state.apiurlDateRangeQuery.to) {
                params.t = state.apiurlDateRangeQuery.to;
            }
        }

        const res = await axiosInstance.get(state.apiurl, {
            timeout: AXIOS_TIMEOUT,
            params
        });

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

        if (error.response && error.response.data && error.response.data.error) {
            state.setError(error.response.data.error);
            state.setLoading(false);
        } else if (error?.code === 'ECONNABORTED' || (error + "").includes('timeout')) {
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

async function fetchItemCount(apiurl: string, updateItemCount: (count: number) => void, retryCount: number = 0): Promise<void> {
    const maxRetries = 3;
    let retries = 0;

    if (apiurl.endsWith("/")) {
        apiurl = apiurl.slice(0, -1);
    }

    while (retries < maxRetries) {
        try {
            const res = await axiosInstance.get("item-count/" + apiurl, {
                timeout: AXIOS_TIMEOUT,
            });

            const itemCount = res.data && res.data['itemCount'];

            if (!itemCount && itemCount !== 0) {
                console.log('fetchItemCount: No record count, server response: ' + JSON.stringify(res.data) + ', Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
                throw new Error();
            }

            updateItemCount(itemCount);
            return;
        } catch (error) {
            if (retries === maxRetries - 1) {
                console.log('fetchItemCount: Error fetching record count: ' + error + ', Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
                if (retryCount < 3) {
                    setTimeout(() => fetchItemCount(apiurl, updateItemCount, retryCount + 1), 30000);
                }
            }
            retries++;
        }
    }

    console.log('fetchItemCount: Error fetching record count: max retries reached, Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
}

export class CachedPaginationFetcher {
    private sortKey: string;
    private direction: "ascending" | "descending";
    private page: number;
    private itemCountPerPage: number;

    constructor(sortKey: string, direction: "ascending" | "descending", page: number, itemCountPerPage: number) {
        this.validateInputs(sortKey, direction, page, itemCountPerPage);
        this.sortKey = sortKey;
        this.direction = direction;
        this.page = page;
        this.itemCountPerPage = itemCountPerPage;
    }

    private validateInputs(sortKey: string, direction: "ascending" | "descending", page: number, itemCountPerPage: number) {
        if (typeof sortKey !== 'string') {
            throw new Error(`Invalid sortKey: ${sortKey}. Expected a string, got ${typeof sortKey}`);
        }
        if (direction !== 'ascending' && direction !== 'descending') {
            throw new Error(`Invalid direction: ${direction}. Expected 'ascending' or 'descending'`);
        }
        if (typeof page !== 'number') {
            throw new Error(`Invalid page: ${page}. Expected a number, got ${typeof page}`);
        }
        if (typeof itemCountPerPage !== 'number') {
            throw new Error(`Invalid count: ${itemCountPerPage}. Expected a number, got ${typeof itemCountPerPage}`);
        }
    }

    getSortKey(): string {
        return this.sortKey;
    }

    getDirection(): "ascending" | "descending" {
        return this.direction;
    }

    getPage(): number {
        return this.page;
    }

    fetchItemCountPerPage(): number {
        return this.itemCountPerPage;
    }

    requestSort(key: string) {
        this.direction = this.getNewDirection(key);
        this.sortKey = key;
    }

    private getNewDirection(key: string): "ascending" | "descending" {
        return this.sortKey === key && this.direction === 'ascending' ? 'descending' : 'ascending';
    }

    setPage(page: number) {
        if (!Number.isInteger(page) || page < 1) {
            throw new Error(`Invalid page: ${page}. The page must be a positive integer.`);
        }
        this.page = page;
    }

    serialize(): string {
        const sortKey = this.sortKey || '-';
        const direction = this.direction === 'ascending' ? 'a' : 'd';
        return `${sortKey},${direction},${this.page},${this.itemCountPerPage}`;
    }

    static deserialize(paginationString: string): CachedPaginationFetcher {
        const [sortKey, direction, page, itemCountPerPage] = CachedPaginationFetcher.ParsePaginationString(paginationString);
        return new CachedPaginationFetcher(sortKey === '-' ? '' : sortKey, direction, Number(page), Number(itemCountPerPage));
    }

    private static ParsePaginationString(paginationString: string): [string, "ascending" | "descending", string, string] {
        let parts = paginationString.split(',');

        if (parts.length === 3) {
            parts = CachedPaginationFetcher.handleThreeParts(parts);
        }

        if (parts.length !== 4) {
            const error = new Error(`Invalid format: the string must have exactly two or three commas. Received: ${paginationString}`);
            console.error(`Error parsing pagination string: ${paginationString}`);
            console.error(error);
            throw error;
        }

        const [sortKey, direction, page, itemCountPerPage] = parts;

        if (!sortKey || !['a', 'asc', 'ascending', 'd', 'desc', 'descending'].includes(direction) || isNaN(Number(page)) || isNaN(Number(itemCountPerPage))) {
            const error = new Error(`Invalid format: the string must be in the format <sortKey>,<direction>,<page>,<itemCountPerPage>. Received: ${paginationString}`);
            console.error(`Error parsing pagination string: ${paginationString}`);
            console.error(error);
            throw error;
        }

        let finalDirection = CachedPaginationFetcher.getFinalDirection(direction);

        return [sortKey, finalDirection, page, itemCountPerPage];
    }

    private static handleThreeParts(parts: string[]): string[] {
        let sortKeyParts = parts[0].split('|');
        if (sortKeyParts.length === 2 && ['a', 'asc', 'ascending', 'd', 'desc', 'descending'].includes(sortKeyParts[1])) {
            return [sortKeyParts[0], sortKeyParts[1], ...parts.slice(1)];
        } else {
            return [sortKeyParts[0], 'a', ...parts.slice(1)];
        }
    }

    private static getFinalDirection(direction: string): "ascending" | "descending" {
        switch (direction) {
            case 'a':
            case 'asc':
            case 'ascending':
                return 'ascending';
            case 'd':
            case 'desc':
            case 'descending':
                return 'descending';
            default:
                throw new Error(`Invalid direction: ${direction}. Expected 'a', 'asc', 'ascending', 'd', 'desc', or 'descending'`);
        }
    }

    duplicate() {
        return new CachedPaginationFetcher(this.getSortKey(), this.getDirection(), this.getPage(), this.fetchItemCountPerPage());
    }

    static usePagination(
        { paginationString, dataKey, setSortAndPaginationConfig, useLastUrlPathInKey }:
            {
                paginationString: string, dataKey: string, useLastUrlPathInKey: boolean,
                setSortAndPaginationConfig: React.Dispatch<React.SetStateAction<SortAndPaginationConfig | null>>
            }) {

        const [cachedPaginationFetcher, setCachedPaginationFetcher] = useState<CachedPaginationFetcher>(() => CachedPaginationFetcher.deserialize(paginationString));
        const { data, loading, error } = useCachedFetch({ dataKey: dataKey, useLastUrlPathInKey: useLastUrlPathInKey, cachedPaginationFetcher: cachedPaginationFetcher });

        const [totalItemCount, setTotalItemCount] = useState<number | null>(null);

        const setTotalItemCountCallback = (count: number) => {
            setTotalItemCount(count);
            setCachedPaginationFetcher(cachedPaginationFetcher.duplicate());
        };

        useEffect(() => {
            const fetchTotalItemCount = async () => {
                const apiurl = getApiUrlFromDataKey(dataKey, useLastUrlPathInKey);
                await fetchItemCount(apiurl, setTotalItemCountCallback);
            };
            fetchTotalItemCount();
        }, [dataKey]);

        const requestSort = (key: string) => {
            cachedPaginationFetcher.requestSort(key);
            setCachedPaginationFetcher(cachedPaginationFetcher.duplicate());
        };

        const setPage = (page: number) => {
            cachedPaginationFetcher.setPage(page);
            setCachedPaginationFetcher(cachedPaginationFetcher.duplicate());
        };

        useEffect(() => {
            const sortAndPaginationConfig: SortAndPaginationConfig = {
                sortKey: cachedPaginationFetcher.getSortKey(),
                direction: cachedPaginationFetcher.getDirection(),
                page: cachedPaginationFetcher.getPage(),
                itemCountPerPage: cachedPaginationFetcher.fetchItemCountPerPage(),
                totalItemCount: totalItemCount
            };
            setSortAndPaginationConfig(sortAndPaginationConfig);
        }, [cachedPaginationFetcher, totalItemCount]);

        return { data, loading, error, requestSort, setPage };
    }
}

function validateDataKey(dataKey: string) {
    const parts = dataKey.split('/');
    // Test the first part (or the whole dataKey if there's no slash)
    if (!parts[0] || parts[0] === "undefined" || parts[0] === "null" || parts[0] === "" || !/^[A-Za-z0-9.]+$/.test(parts[0])) {
        console.error(`Invalid arguments: dataKey=${dataKey}`);
        throw new Error(`Invalid dataKey: ${dataKey}. The first part of dataKey (or the whole dataKey if there's no slash) must be a non-empty string that only contains the characters A-Z, a-z, 0-9, and dot.`);
    }

    if (parts.length > 1) {
        // Test the part after the slash
        if (!/^[A-Za-z0-9\@]+$/.test(parts[1])) {
            console.error(`Invalid arguments: dataKey=${dataKey}`);
            throw new Error(`Invalid LastUrlPath: ${parts[1]}. The LastUrlPath must match a lava id, starting with 'lava@' or spec id: [A-Za-z0-9]+`);
        }
    }
}

function getApiUrlFromDataKey(dataKey: string, useLastUrlPathInKey: boolean = false): string {
    if (typeof window === 'undefined') throw new Error("getApiUrlFromDataKey can only be used in a browser environment");

    validateDataKey(dataKey)

    let apiurl = dataKey;
    if (useLastUrlPathInKey) {
        const apiKey = window.location.pathname.split('/').pop() || '';
        apiurl += "/" + apiKey;
    }
    return apiurl;
}

interface UseCachedFetchProps {
    dataKey: string;
    useLastUrlPathInKey?: boolean;
    cachedPaginationFetcher?: CachedPaginationFetcher | null;
    apiurlDateRangeQuery?: CachedFetchDateRange | null;
}

export function useCachedFetch({
    dataKey,
    useLastUrlPathInKey = false,
    cachedPaginationFetcher = null,
    apiurlDateRangeQuery = null
}: UseCachedFetchProps) {

    validateDataKey(dataKey)

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const retryTimeout = useRef<number>(1000);
    const retryCount = useRef<number>(0);
    const errorCount = useRef<number>(0);
    const isFetching = useRef<boolean>(false);
    const wasOneFetchDone = useRef<boolean>(false);

    const state: FetchState = {
        apiurl: null,
        apiurlPaginationQuery: cachedPaginationFetcher ? cachedPaginationFetcher.serialize() : null,
        apiurlDateRangeQuery: apiurlDateRangeQuery || null,
        retryTimeout: retryTimeout,
        retryCount: retryCount,
        errorCount: errorCount,
        isFetching: isFetching,
        wasOneFetchDone: wasOneFetchDone,
        setData: setData,
        setLoading: setLoading,
        setError: setError,
    };

    const fetchDataWithRetryWrapper = useCallback(() => {
        fetchDataWithRetry(state);
    }, [fetchDataWithRetry, state]);

    useEffect(() => {

        state.apiurl = getApiUrlFromDataKey(dataKey, useLastUrlPathInKey);

        fetchDataWithRetryWrapper();

    }, [dataKey, fetchDataWithRetry, cachedPaginationFetcher, apiurlDateRangeQuery, useLastUrlPathInKey]);

    return { data, loading, error };
}