// src/components/PaginationControl.tsx
"use client"

import React from 'react';
import { SortAndPaginationConfig } from '@jsinfo/common/types';

interface PaginationControlProps {
    sortAndPaginationConfig: SortAndPaginationConfig;
    setPage: (page: number) => void;
}


// export const fetchCache = 'force-no-store';
// export const dynamic = 'force-dynamic'

function PaginationControl({ sortAndPaginationConfig, setPage }: PaginationControlProps) {

    if (!sortAndPaginationConfig || !sortAndPaginationConfig.totalItemCount || !sortAndPaginationConfig.itemCountPerPage) return null;

    const totalPages = Math.ceil(sortAndPaginationConfig.totalItemCount / sortAndPaginationConfig.itemCountPerPage) || 3;
    const pageNumbers: number[] = [];

    const isMobile = window.innerWidth <= 768;

    for (let i = 1; i <= totalPages; i++) {
        if (isMobile) {
            if (i >= sortAndPaginationConfig.page - 1 && i <= sortAndPaginationConfig.page + 1) {
                pageNumbers.push(i);
            }
        } else {
            if (i <= 3 || i > totalPages - 3 || (i >= sortAndPaginationConfig.page - 1 && i <= sortAndPaginationConfig.page + 1)) {
                pageNumbers.push(i);
            }
        }
    }

    const handleSetPage = (page: number) => {
        // console.log(`Setting page to ${page}, sortAndPaginationConfig: ${JSON.stringify(sortAndPaginationConfig)}`);
        setPage(page);
    };

    return (
        <div className="paginationcontrol">
            <button className="active nowrap" onClick={() => handleSetPage(1)} disabled={sortAndPaginationConfig.page === 1}>|&lt;</button>
            <button className="active" onClick={() => handleSetPage(Math.max(1, sortAndPaginationConfig.page - 1))} disabled={sortAndPaginationConfig.page === 1}>&lt;</button>
            {pageNumbers.map(number =>
                number === sortAndPaginationConfig.page
                    ? <span key={number} className="active">{number}</span>
                    : <button key={number} onClick={() => handleSetPage(number)}>{number}</button>
            )}
            <button className="active" onClick={() => handleSetPage(Math.min(totalPages, sortAndPaginationConfig.page + 1))} disabled={sortAndPaginationConfig.page === totalPages}>&gt;</button>
            <button className="active nowrap" onClick={() => handleSetPage(totalPages)} disabled={sortAndPaginationConfig.page === totalPages}>&gt;|</button>
        </div>
    );
}

export default PaginationControl;