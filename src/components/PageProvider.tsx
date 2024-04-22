// src/components/PageProvider.tsx
"use client";

import { useState } from 'react';
import { PageContext } from '@jsinfo/context/PageContext';

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('');

    return (
        <PageContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </PageContext.Provider>
    );
}