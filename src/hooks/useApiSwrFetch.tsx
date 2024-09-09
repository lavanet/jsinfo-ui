// src/hooks/useApiSwrFetch.tsx

// this refetches things every x seconds and will not fetch if the component is not mounted

import useSWR from "swr";
import { AxiosApiGet, AxiosApiResponse } from "../fetching/axios";

const axiosFetcher = async (url: string) => {
    const response: AxiosApiResponse = await AxiosApiGet(url);
    if (response.status != 200) {
        throw new Error(`SWR API request failed with status ${response.status}: ${response.statusText} to ${url}`);
    }
    return response.data;
};

export function useApiSwrFetch<T = any>(url: string | (() => string | null)) {
    const { data, error, isLoading } = useSWR<T>(url, axiosFetcher, {
        refreshInterval: 5 * 60 * 1000,
        revalidateOnFocus: false,
        keepPreviousData: true,
    });
    return { data, error, isLoading };
}

export function useApiSwrFetchWithDeps<T = any>(
    urlOrFunction: string | (() => string | null),
    dependencies: any[] = []
) {
    const { data, error, isLoading } = useSWR<T>(
        () => {
            if (typeof urlOrFunction === 'function') {
                const result = urlOrFunction();
                return result ? [result, ...dependencies] : null;
            }
            return [urlOrFunction, ...dependencies];
        },
        ([url]) => axiosFetcher(url),
        {
            refreshInterval: 5 * 60 * 1000,
            revalidateOnFocus: false,
            keepPreviousData: true,
        }
    );
    return { data, error, isLoading };
}