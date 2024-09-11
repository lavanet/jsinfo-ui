// src/components/layout/SearchBar.tsx

"use client";

/*
this is the css that fucks me up:
position: relative; --radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px;
*/

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useApiFetch } from '@jsinfo/hooks/useApiFetch';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';

interface Item {
    id: string;
    name: string;
    type: string;
    link: string;
    moniker: string;
}

export default function SearchBar() {
    const [items, setItems] = useState<Item[]>([]);
    const { data, loading, error } = useApiFetch("autoCompleteLinksV2Handler");
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!error && !loading && data?.data) {
            const processedItems = data.data.map((item: Item, index: number) => ({
                ...item,
                id: `${item.id}-${index}`
            }));
            setItems(processedItems);
        }
    }, [data, loading, error]);

    const handleOnSelect = (item: Item) => {
        if (item && item.link) {
            router.push(item.link);
        }
    };

    const formatResult = (item: Item) => (
        <>
            <span className="searchBarElement">
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}:{' '}
                {item.name.length > 20 ? item.name.slice(0, 30) + ' ...' : item.name}
            </span>
            {item.moniker && (
                <span className="searchBarElement">
                    Moniker: {item.moniker}
                </span>
            )}
        </>
    );

    return (
        <div className="ml-auto flex-1 sm:flex-initial w-full max-w-xs">
            <div ref={searchRef} className="relative top-search-bar">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
                <ReactSearchAutocomplete
                    items={items}
                    onSelect={handleOnSelect}
                    formatResult={formatResult}
                    maxResults={10}
                    styling={{
                        height: "38px",
                        border: "1px solid #4a5568",
                        borderRadius: "0.375rem",
                        backgroundColor: "var(--background-color)",
                        boxShadow: "none",
                        hoverBackgroundColor: "#2d3748",
                        color: "#e2e8f0",
                        fontSize: "0.875rem",
                        iconColor: "transparent",
                        lineColor: "#4a5568",
                        placeholderColor: "#a0aec0",
                        clearIconMargin: "3px 8px 0 0",
                        zIndex: 999999999,
                        searchIconMargin: "0 0 0 16px",
                    }}
                    inputSearchString=""
                    placeholder="Search ..."
                    showIcon={false}
                    inputDebounce={300}
                // className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
            </div>
        </div>
    );
}