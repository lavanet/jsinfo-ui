// jsinfo-ui/components/PaginationControl.tsx

import React from 'react';
import { SortAndPaginationConfig } from '../src/types';


interface PaginationControlProps {
    sortAndPaginationConfig: SortAndPaginationConfig;
    setPage: (page: number) => void;
}

function PaginationControl({ sortAndPaginationConfig, setPage }: PaginationControlProps) {

    if (!sortAndPaginationConfig || !sortAndPaginationConfig.totalItemCount || !sortAndPaginationConfig.itemCountPerPage) return null;

    const totalPages = Math.ceil(sortAndPaginationConfig.totalItemCount / sortAndPaginationConfig.itemCountPerPage) || 3;
    const pageNumbers: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
        if (i <= 3 || i > totalPages - 3 || (i >= sortAndPaginationConfig.page - 1 && i <= sortAndPaginationConfig.page + 1)) {
            pageNumbers.push(i);
        }
    }

    const handleSetPage = (page: number) => {
        // console.log(`Setting page to ${page}, sortAndPaginationConfig: ${JSON.stringify(sortAndPaginationConfig)}`);
        setPage(page);
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px',
        margin: '5px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        width: '60px', // Set a fixed width that's wide enough for 3 digits
        textAlign: 'center', // Center the text
        fontFamily: 'monospace', // Use a monospace font
    };

    const activeStyle: React.CSSProperties = {
        ...buttonStyle,
        fontWeight: 'bold',
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
            <button style={buttonStyle} onClick={() => handleSetPage(1)} disabled={sortAndPaginationConfig.page === 1}>&lt;&lt;</button>
            <button style={buttonStyle} onClick={() => handleSetPage(Math.max(1, sortAndPaginationConfig.page - 1))} disabled={sortAndPaginationConfig.page === 1}>&lt;</button>
            {pageNumbers.map(number =>
                number === sortAndPaginationConfig.page
                    ? <span key={number} style={activeStyle}>{number}</span>
                    : <button style={buttonStyle} key={number} onClick={() => handleSetPage(number)}>{number}</button>
            )}
            <button style={buttonStyle} onClick={() => handleSetPage(Math.min(totalPages, sortAndPaginationConfig.page + 1))} disabled={sortAndPaginationConfig.page === totalPages}>&gt;</button>
            <button style={buttonStyle} onClick={() => handleSetPage(totalPages)} disabled={sortAndPaginationConfig.page === totalPages}>&gt;&gt;</button>
        </div>
    );
}

export default PaginationControl;