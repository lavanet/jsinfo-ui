// src/common/types.tsx

export type Column = {
    key: string;
    name: string;
    altKey?: string;
}

export type SortConfig = {
    key: string,
    direction: "ascending" | "descending",
};

export type RowFormatters = {
    [key: string]: (rowData: any) => JSX.Element | string | null;
};

export interface SortableData {
    tableData: any[];
    requestSort: (key: string) => void;
    sortConfig: SortConfig;
}

export interface SortAndPaginationConfig {
    sortKey: string;
    direction: "ascending" | "descending";
    page: number;
    itemCountPerPage: number;
    totalItemCount: number | null;
}

export interface CachedFetchDateRange {
    from?: Date | string | null;
    to?: Date | string | null;
}