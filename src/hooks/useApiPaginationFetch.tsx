// src/hooks/useApiPaginationFetch.tsx

import { useEffect, useMemo } from 'react';
import { SortAndPaginationConfig } from '@jsinfo/common/types.jsx';
import { ValidateDataKey } from './utils';
import { AxiosDataLoader } from './AxiosDataLoader';

export class PaginationState {
    private sortKey: string;
    private direction: "ascending" | "descending";
    private page: number;
    private itemCountPerPage: number;
    private totalItemCount: number = 60;
    private updateCallbacks: React.SetStateAction<SortAndPaginationConfig>[] = [];

    public constructor(sortKey: string, direction: "ascending" | "descending", page: number, itemCountPerPage: number) {
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

    public GetTotalItemCount(): number {
        return this.totalItemCount;
    }

    public SetTotalItemCount(value: number): void {
        this.totalItemCount = value;
    }

    public GetSortKey(): string {
        return this.sortKey;
    }

    public GetDirection(): "ascending" | "descending" {
        return this.direction;
    }

    public GetPage(): number {
        return this.page;
    }

    public GetSortAndPaginationConfig(): SortAndPaginationConfig {
        return {
            sortKey: this.GetSortKey(),
            direction: this.GetDirection(),
            page: this.GetPage(),
            itemCountPerPage: this.GetItemCountPerPage(),
            totalItemCount: this.GetTotalItemCount()
        }
    }

    public RegisterUpdateCallback(callback: React.SetStateAction<SortAndPaginationConfig>): void {
        if (typeof callback !== 'function') {
            const typeStr = typeof callback;
            let callbackStr;
            try {
                callbackStr = JSON.stringify(callback).slice(0, 1000);
            } catch {
                callbackStr = (callback + "").slice(0, 1000);
            }
            throw new Error(`callback must be a function or an instance of SortAndPaginationConfig, got ${typeStr}, callback: ${callbackStr}`);
        }

        this.updateCallbacks.push(callback);
    }

    public NotifyConfigUpdate(): void {
        const sc: SortAndPaginationConfig = this.GetSortAndPaginationConfig();
        this.updateCallbacks.forEach(callback => {
            if (typeof callback === 'function') {
                callback(sc);
            }
        });
    }

    public GetItemCountPerPage(): number {
        return this.itemCountPerPage;
    }

    public RequestSort(key: string) {
        this.direction = this.getNewDirection(key);
        this.sortKey = key;
    }

    private getNewDirection(key: string): "ascending" | "descending" {
        return this.sortKey === key && this.direction === 'ascending' ? 'descending' : 'ascending';
    }

    public SetPage(page: number) {
        if (!Number.isInteger(page) || page < 1) {
            throw new Error(`Invalid page: ${page}. The page must be a positive integer.`);
        }
        this.page = page;
    }

    public Serialize(): string {
        const sortKey = this.sortKey || '-';
        const direction = this.direction === 'ascending' ? 'a' : 'd';
        return `${sortKey},${direction},${this.page},${this.itemCountPerPage}`;
    }

    static Deserialize(paginationString: string): PaginationState {
        const [sortKey, direction, page, itemCountPerPage] = PaginationState.ParsePaginationString(paginationString);
        return new PaginationState(sortKey === '-' ? '' : sortKey, direction, Number(page), Number(itemCountPerPage));
    }

    private static ParsePaginationString(paginationString: string): [string, "ascending" | "descending", string, string] {
        let parts = paginationString.split(',');

        if (parts.length === 3) {
            parts = PaginationState.handleThreeParts(parts);
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

        let finalDirection = PaginationState.getFinalDirection(direction);

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
}

interface UseApiPaginationFetchReturn {
    data: any;
    loading: boolean;
    error: any;
    requestSort: (key: string) => void;
    setPage: (page: number) => void;
    paginationState: PaginationState;
}

export function useApiPaginationFetch({
    dataKey,
    paginationString,
}: {
    dataKey: string,
    paginationString: string,
}): UseApiPaginationFetchReturn {

    if (typeof dataKey !== 'string' || dataKey.trim() === '') {
        throw new Error('dataKey must be a non-empty string');
    }

    if (typeof paginationString !== 'string' || paginationString.trim() === '') {
        throw new Error('paginationString must be a non-empty string');
    }

    ValidateDataKey(dataKey);

    const paginationState: PaginationState = useMemo(() => PaginationState.Deserialize(paginationString), [paginationString]);
    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, paginationState.Serialize());

    function updatePagination() {
        fetcher.SetApiUrlPaginationQuery(paginationState.Serialize());
        fetcher.FetchAndPopulateData();
        paginationState.NotifyConfigUpdate();
    }

    const setTotalItemCountCallback = (count: number) => {
        paginationState.SetTotalItemCount(count);
        paginationState.NotifyConfigUpdate();
    };

    useEffect(() => {
        const fetchTotalItemCount = async () => {
            await fetcher.FetchItemCount(setTotalItemCountCallback);
        };
        fetchTotalItemCount();
        fetcher.FetchAndPopulateData();
    }, []);

    const requestSort = (key: string) => {
        paginationState.RequestSort(key);
        updatePagination();
    };

    const setPage = (page: number) => {
        paginationState.SetPage(page);
        updatePagination();
    };

    return { data, loading, error, requestSort, setPage, paginationState };
}
