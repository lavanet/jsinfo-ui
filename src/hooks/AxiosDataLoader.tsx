// src/hooks/AxiosDataLoader.tsx

import { useRef, useState, Dispatch, SetStateAction } from 'react';
import { AxiosApiGet } from './axios';
import { GetAxiosRetryCount } from '@jsinfo/common/env';

export class AxiosDataLoader {
    private maxRetries = GetAxiosRetryCount();

    private apiurl: string | null;
    private apiurlPaginationQuery: string | null;
    private apiurlDateRangeQuery: any | null;
    private retryTimeout: React.MutableRefObject<number>;
    private retryCount: React.MutableRefObject<number>;
    private errorCount: React.MutableRefObject<number>;
    private isFetching: React.MutableRefObject<boolean>;
    private wasOneFetchDone: React.MutableRefObject<boolean>;
    private setData: Dispatch<SetStateAction<any>>;
    private setLoading: Dispatch<SetStateAction<boolean>>;
    private setError: Dispatch<SetStateAction<string | null>>;

    private constructor(apiurlDateRangeQuery: any, paginationFetcherHook: any,
        setData: Dispatch<SetStateAction<any>>,
        setLoading: Dispatch<SetStateAction<boolean>>,
        setError: Dispatch<SetStateAction<string | null>>,
        retryTimeout: React.MutableRefObject<number>,
        retryCount: React.MutableRefObject<number>,
        errorCount: React.MutableRefObject<number>,
        isFetching: React.MutableRefObject<boolean>,
        wasOneFetchDone: React.MutableRefObject<boolean>) {
        this.apiurlPaginationQuery = paginationFetcherHook ? paginationFetcherHook.serialize() : null;
        this.apiurlDateRangeQuery = apiurlDateRangeQuery || null;
        this.setData = setData;
        this.setLoading = setLoading;
        this.setError = setError;
        this.retryTimeout = retryTimeout;
        this.retryCount = retryCount;
        this.errorCount = errorCount;
        this.isFetching = isFetching;
        this.wasOneFetchDone = wasOneFetchDone;
        this.apiurl = null;
    }

    static initialize(dataKey: string, apiurlDateRangeQuery: any, paginationFetcherHook: any) {
        const [data, setData] = useState<any>(null);
        const [loading, setLoading] = useState<boolean>(true);
        const [error, setError] = useState<string | null>(null);
        const retryTimeout = useRef<number>(1000);
        const retryCount = useRef<number>(0);
        const errorCount = useRef<number>(0);
        const isFetching = useRef<boolean>(false);
        const wasOneFetchDone = useRef<boolean>(false);

        const fetcher = new AxiosDataLoader(apiurlDateRangeQuery, paginationFetcherHook, setData, setLoading, setError, retryTimeout, retryCount, errorCount, isFetching, wasOneFetchDone);
        fetcher.SetApiUrl(dataKey);

        return { fetcher, data, loading, error };
    }

    public SetApiUrl(apiurl: string) {
        this.apiurl = apiurl;
    }

    async FetchItemCount(updateItemCount: (count: number) => void, retryCount: number = 0): Promise<void> {
        let retries = 0;

        let apiurl = this.apiurl;
        if (apiurl && apiurl.endsWith("/")) {
            apiurl = apiurl.slice(0, -1);
        }

        while (retries < this.maxRetries) {
            try {
                const res = await AxiosApiGet("item-count/" + apiurl);
                const itemCount = res.data && res.data['itemCount'];

                if (!itemCount && itemCount !== 0) {
                    console.log('FetchItemCount: No record count, server response: ' + JSON.stringify(res.data) + ', Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
                    throw new Error();
                }

                updateItemCount(itemCount);
                return;
            } catch (error) {
                if (retries === this.maxRetries - 1) {
                    console.log('FetchItemCount: Error fetching record count: ' + error + ', Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
                    if (retryCount < 3) {
                        setTimeout(() => this.FetchItemCount(updateItemCount, retryCount + 1), 30000);
                    }
                }
                retries++;
            }
        }

        console.log('FetchItemCount: Error fetching record count: max retries reached, Function arguments: ' + JSON.stringify({ apiurl, retryCount }));
    }

    private async handleEmptyData(): Promise<void> {
        if (this.wasOneFetchDone.current) return;
        if (this.retryCount.current < 50) {
            setTimeout(() => this.FetchAndPopulateData(), this.retryTimeout.current);
            this.retryTimeout.current += 100;
            this.retryCount.current += 1;
        } else {
            this.setError('Request timed out');
            this.setLoading(false);
        }
    }

    private async handleData(data: any): Promise<void> {
        this.wasOneFetchDone.current = true;
        this.setData(data);
        this.setLoading(false);
    }

    private async handleError(error: Error): Promise<void> {
        if (this.wasOneFetchDone.current) return;
        console.log(`API URL: ${this.apiurl}, Error:`, error);
        this.setError(error.message);
        this.setLoading(false);
    }

    async FetchAndPopulateData(): Promise<void> {
        if (!this.apiurl || this.apiurl === "undefined" || this.apiurl === "null" || this.apiurl === "") {
            console.error(`FetchAndPopulateData invalid arguments: this.apiurl=${this.apiurl}, state=${this}}`);
            throw new Error(`FetchAndPopulateData invalid arguments: this.apiurl=${this.apiurl}`);
        }

        try {
            if (this.isFetching.current) return;
            this.isFetching.current = true;

            let params: any = {};

            if (this.apiurlPaginationQuery) {
                params.pagination = this.apiurlPaginationQuery;
            }

            if (this.apiurlDateRangeQuery) {
                if (this.apiurlDateRangeQuery.from) {
                    params.f = this.apiurlDateRangeQuery.from;
                }
                if (this.apiurlDateRangeQuery.to) {
                    params.t = this.apiurlDateRangeQuery.to;
                }
            }

            const res = await AxiosApiGet(this.apiurl, params);
            const data = res.data;
            this.isFetching.current = false;

            if (data && data.error) {
                this.setError(data.error);
                this.setLoading(false);
            } else if (!data || Object.keys(data).length === 0) {
                await this.handleEmptyData();
            } else {
                await this.handleData(data);
            }

        } catch (error: any) {
            this.isFetching.current = false;

            if (error.response && error.response.data && error.response.data.error) {
                this.setError(error.response.data.error);
                this.setLoading(false);
            } else if (error?.code === 'ECONNABORTED' || (error + "").includes('timeout')) {
                await this.handleEmptyData();
            } else {
                this.errorCount.current++;
                if (this.errorCount.current <= 5) {
                    await this.handleEmptyData();
                } else {
                    await this.handleError(error);
                }
            }
        }
    }
}
