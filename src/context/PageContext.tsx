// src/app/context/PageContext.tsx
"use client"

import { createContext, useContext } from 'react';

interface PageContextType {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

export const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePageContext must be used within a PageProvider');
    }
    return context;
}