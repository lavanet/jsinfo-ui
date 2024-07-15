// src/hooks/PaginationFetcherHook.tsx

import { useState, useEffect } from 'react';
import { SortAndPaginationConfig, SortConfig } from '@jsinfo/common/types.jsx';
import { ValidateDataKey } from './utils';
import { AxiosDataLoader } from './AxiosDataLoader';

export class PaginationFetcherHook {
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

    GetSortKey(): string {
        return this.sortKey;
    }

    GetDirection(): "ascending" | "descending" {
        return this.direction;
    }

    GetPage(): number {
        return this.page;
    }

    FetchItemCountPerPage(): number {
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

    static deserialize(paginationString: string): PaginationFetcherHook {
        const [sortKey, direction, page, itemCountPerPage] = PaginationFetcherHook.ParsePaginationString(paginationString);
        return new PaginationFetcherHook(sortKey === '-' ? '' : sortKey, direction, Number(page), Number(itemCountPerPage));
    }

    private static ParsePaginationString(paginationString: string): [string, "ascending" | "descending", string, string] {
        let parts = paginationString.split(',');

        if (parts.length === 3) {
            parts = PaginationFetcherHook.handleThreeParts(parts);
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

        let finalDirection = PaginationFetcherHook.getFinalDirection(direction);

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
        return new PaginationFetcherHook(this.GetSortKey(), this.GetDirection(), this.GetPage(), this.FetchItemCountPerPage());
    }

}

export function useApiPaginationFetch({
    paginationString,
    dataKey,
    setSortAndPaginationConfig,
    onSortConfigUpdate
}: {
    paginationString: string,
    dataKey: string,
    setSortAndPaginationConfig: React.Dispatch<React.SetStateAction<SortAndPaginationConfig | null>>,
    onSortConfigUpdate?: { callback?: React.Dispatch<React.SetStateAction<SortConfig | null>> } | null
}) {

    ValidateDataKey(dataKey);

    const [paginationFetcherHook, setPaginationFetcherHook] = useState<PaginationFetcherHook>(() => PaginationFetcherHook.deserialize(paginationString));

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, paginationFetcherHook);

    function updatePagination() {
        setPaginationFetcherHook(paginationFetcherHook.duplicate());
        fetcher.SetApiUrlPaginationQuery(paginationFetcherHook);
        fetcher.FetchAndPopulateData();
        if (onSortConfigUpdate && onSortConfigUpdate.callback) {
            const sc: SortConfig = {
                key: paginationFetcherHook.GetSortKey(),
                direction: paginationFetcherHook.GetDirection(),
            };
            onSortConfigUpdate.callback(sc)
        }
    }

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    const [totalItemCount, setTotalItemCount] = useState<number | null>(null);

    const setTotalItemCountCallback = (count: number) => {
        setTotalItemCount(count);
        updatePagination();
    };

    useEffect(() => {
        const fetchTotalItemCount = async () => {
            setTotalItemCountCallback(4999);
            await fetcher.FetchItemCount(setTotalItemCountCallback);
        };
        fetchTotalItemCount();
    }, [dataKey]);

    const requestSort = (key: string) => {
        paginationFetcherHook.requestSort(key);
        updatePagination();
    };

    const setPage = (page: number) => {
        paginationFetcherHook.setPage(page);
        updatePagination();
    };

    useEffect(() => {
        const sortAndPaginationConfig: SortAndPaginationConfig = {
            sortKey: paginationFetcherHook.GetSortKey(),
            direction: paginationFetcherHook.GetDirection(),
            page: paginationFetcherHook.GetPage(),
            itemCountPerPage: paginationFetcherHook.FetchItemCountPerPage(),
            totalItemCount: totalItemCount
        };
        setSortAndPaginationConfig(sortAndPaginationConfig);
    }, [PaginationFetcherHook, totalItemCount]);

    return { data, loading, error, requestSort, setPage };
}

