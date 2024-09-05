// src/components/legacy/PaginationControl.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@jsinfo/components/shadcn/ui2/Pagination";
import { SortAndPaginationConfig } from "@jsinfo/lib/types";
import { PaginationState } from "@jsinfo/hooks/useApiPaginationFetch";

interface PaginationControlProps {
    paginationState: PaginationState;
    setPage: (page: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({ paginationState, setPage }) => {
    if (!paginationState || !(paginationState instanceof PaginationState)) {
        const typeStr = Object.prototype.toString.call(paginationState);
        const objStr = JSON.stringify(paginationState, null, 2).slice(0, 1000);
        throw new Error(`paginationState must be an instance of PaginationState, got ${typeStr}, object: ${objStr}`);
    }

    if (typeof setPage !== "function") {
        throw new Error("setPage must be a function");
    }

    const [sortAndPaginationConfig, setSortAndPaginationConfig] = useState<SortAndPaginationConfig>(
        paginationState.GetSortAndPaginationConfig()
    );
    const [totalPages, setTotalPages] = useState(0);
    const [pageNumbers, setPageNumbers] = useState<number[]>([]);

    paginationState.RegisterUpdateCallback(setSortAndPaginationConfig);

    useEffect(() => {
        if (!sortAndPaginationConfig || !sortAndPaginationConfig.totalItemCount || !sortAndPaginationConfig.itemCountPerPage) return;
        const newTotalPages = Math.ceil(sortAndPaginationConfig.totalItemCount / sortAndPaginationConfig.itemCountPerPage);
        setTotalPages(newTotalPages);

        const newPageNumbers: number[] = [];
        for (let i = 1; i <= newTotalPages; i++) {
            newPageNumbers.push(i);
        }
        setPageNumbers(newPageNumbers);
    }, [sortAndPaginationConfig]);

    const handleSetPage = (page: number) => {
        setPage(page);
    };

    const renderPaginationItems = () => {
        const ellipsisThreshold = 2;

        return pageNumbers.map((number: number) => {
            if (number === 1 || number === totalPages || (number >= sortAndPaginationConfig.page - ellipsisThreshold && number <= sortAndPaginationConfig.page + ellipsisThreshold)) {
                console.log("rendering number", number);
                return (
                    <PaginationItem key={number}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSetPage(number);
                            }}
                            isActive={number === sortAndPaginationConfig.page}
                        >
                            {number}
                        </PaginationLink>
                    </PaginationItem>
                );
            } else if (
                (number === sortAndPaginationConfig.page - ellipsisThreshold - 1 && number > 1) ||
                (number === sortAndPaginationConfig.page + ellipsisThreshold + 1 && number < totalPages)
            ) {
                return (
                    <PaginationItem key={number}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        });
    };

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                {sortAndPaginationConfig.page > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSetPage(Math.max(1, sortAndPaginationConfig.page - 1));
                            }}
                        />
                    </PaginationItem>
                )}
                {renderPaginationItems()}
                {sortAndPaginationConfig.page < totalPages && (
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSetPage(Math.min(totalPages, sortAndPaginationConfig.page + 1));
                            }}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationControl;
