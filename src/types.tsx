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
    [key: string]: (rowData: any) => JSX.Element;
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

export function ConvertToSortConfig(config: SortAndPaginationConfig): SortConfig {
    return {
        key: config.sortKey,
        direction: config.direction
    };
}