// src/components/PaginationControl.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { SortAndPaginationConfig } from '@jsinfo/lib/types';
import { PaginationState } from '@jsinfo/hooks/useApiPaginationFetch';

interface PaginationControlProps {
    paginationState: PaginationState;
    setPage: (page: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({ paginationState, setPage }: PaginationControlProps) => {
    if (!paginationState || !(paginationState instanceof PaginationState)) {
        const typeStr = Object.prototype.toString.call(paginationState);
        const objStr = JSON.stringify(paginationState, null, 2).slice(0, 1000);
        throw new Error(`paginationState must be an instance of PaginationState, got ${typeStr}, object: ${objStr}`);
    }

    if (typeof setPage !== 'function') {
        throw new Error("setPage must be a function");
    }

    const [sortAndPaginationConfig, setSortAndPaginationConfig] = useState<SortAndPaginationConfig>(paginationState.GetSortAndPaginationConfig());
    if (!sortAndPaginationConfig || !sortAndPaginationConfig.totalItemCount || !sortAndPaginationConfig.itemCountPerPage) return null;
    paginationState.RegisterUpdateCallback(setSortAndPaginationConfig);

    const [totalPages, setTotalPages] = useState(0);
    const [pageNumbers, setPageNumbers] = useState<number[]>([]);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : 0);

    useEffect(() => {
        if (!sortAndPaginationConfig || !sortAndPaginationConfig.totalItemCount || !sortAndPaginationConfig.itemCountPerPage) return;
        const newTotalPages = Math.ceil(sortAndPaginationConfig.totalItemCount / sortAndPaginationConfig.itemCountPerPage) || 3;
        setTotalPages(newTotalPages);

        const newPageNumbers: number[] = [];
        for (let i = 1; i <= newTotalPages; i++) {
            if (isMobile) {
                if (i >= sortAndPaginationConfig.page - 1 && i <= sortAndPaginationConfig.page + 1) {
                    newPageNumbers.push(i);
                }
            } else {
                if (i <= 3 || i > newTotalPages - 3 || (i >= sortAndPaginationConfig.page - 1 && i <= sortAndPaginationConfig.page + 1)) {
                    newPageNumbers.push(i);
                }
            }
        }
        setPageNumbers(newPageNumbers);
    }, [sortAndPaginationConfig, isMobile]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSetPage = (page: number) => {
        setPage(page);
    };

    return (
        <div className="paginationcontrol">
            <button className="active nowrap" onClick={() => handleSetPage(1)} disabled={sortAndPaginationConfig.page === 1}>|&lt;</button>
            <button className="active" onClick={() => handleSetPage(Math.max(1, sortAndPaginationConfig.page - 1))} disabled={sortAndPaginationConfig.page === 1}>&lt;</button>
            {pageNumbers.map((number: number) =>
                number === sortAndPaginationConfig.page
                    ? <span key={number} className="active" style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{number}</span>
                    : <button key={number} onClick={() => handleSetPage(number)}>{number}</button>
            )}
            <button className="active" onClick={() => handleSetPage(Math.min(totalPages, sortAndPaginationConfig.page + 1))} disabled={sortAndPaginationConfig.page === totalPages}>&gt;</button>
            <button className="active nowrap" onClick={() => handleSetPage(totalPages)} disabled={sortAndPaginationConfig.page === totalPages}>&gt;|</button>
        </div>
    );
}

export default PaginationControl;