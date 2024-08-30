// src/hooks/useApiSWR.tsx

import useSWR from "swr";
import { AxiosApiGet, AxiosApiResponse } from "../fetching/axios";

const axiosFetcher = async (url: string) => {
    const response: AxiosApiResponse = await AxiosApiGet(url);
    if (response.status != 200) {
        throw new Error(`SWR API request failed with status ${response.status}: ${response.statusText} to ${url}`);
    }
    return response.data;
};

export default function useApiSWR<T = any>(url: string) {
    const { data, error, isLoading } = useSWR<T>(url, axiosFetcher);
    return { data, error, isLoading };
}
