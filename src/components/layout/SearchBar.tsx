// src/components/layout/SearchBar.tsx

"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@jsinfo/components/shadcn/ui2/Input';

export default function SearchForm() {
    return (
        <form className="ml-auto flex-1 sm:flex-initial">
            <div className="top-header-search-input-container relative">
                <Search className="top-header-search-input absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search ..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
            </div>
        </form>
    );
}