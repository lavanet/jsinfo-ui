// src/components/layout/SearchBar.tsx

"use client";

/*
this is the css that fucks me up:
position: relative; --radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px;
*/

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import ReactDOM from 'react-dom';

interface Item {
    id: string;
    name: string;
    type: string;
    link: string;
    moniker: string;
}

function CustomSearchIcon() {
    return <Search className="absolute h-4 w-4 text-gray" />;
}

export default function SearchBar() {
    const [items, setItems] = useState<Item[]>([]);
    const { data, isLoading, error } = useJsinfobeFetch("autoCompleteLinksV2Handler");
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    function toggleChartPositionRelativeOverride(isOpen: boolean) {

        const legendWrapper = document.querySelector('.recharts-wrapper');

        if (!legendWrapper) return;

        if (isOpen) {
            legendWrapper.classList.add('search-open');
        } else {
            legendWrapper.classList.remove('search-open');
        }
    }

    useEffect(() => {
        if (!error && !isLoading && data?.data) {
            const processedItems = data.data.map((item: Item, index: number) => ({
                ...item,
                id: `${item.id}-${index}`
            }));
            setItems(processedItems);
        }
    }, [data, isLoading, error]);

    const handleOnSelect = (item: Item) => {
        if (item && item.link) {
            router.push(item.link);
        }
        toggleChartPositionRelativeOverride(true);
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

    const insertSearchIcon = () => {
        if (searchRef.current) {
            const input = searchRef.current.querySelector('.top-search-bar > div > div > div > input') as HTMLInputElement;
            if (input && !input.previousElementSibling?.classList.contains('custom-search-icon')) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'custom-search-icon';
                iconContainer.style.position = 'absolute';
                iconContainer.style.left = '10px';
                iconContainer.style.top = '27%';
                iconContainer.style.transform = 'translateY(-50%)';
                iconContainer.style.zIndex = '1';
                ReactDOM.render(<CustomSearchIcon />, iconContainer);
                input.parentNode?.insertBefore(iconContainer, input);

                const originalPlaceholder = input.placeholder;

                const updateIconAndPlaceholder = () => {
                    if (input.value) {
                        iconContainer.style.display = 'none';
                    } else {
                        iconContainer.style.display = document.activeElement === input ? 'none' : 'block';
                    }
                    input.placeholder = document.activeElement === input ? '' : originalPlaceholder;
                };

                input.addEventListener('focus', updateIconAndPlaceholder);
                input.addEventListener('blur', updateIconAndPlaceholder);
                input.addEventListener('input', updateIconAndPlaceholder);

                // Initial update
                updateIconAndPlaceholder();
            }
        }
    };

    useEffect(() => {
        insertSearchIcon();
        // Clean up event listeners on component unmount
        return () => {
            const input = searchRef.current?.querySelector('.top-search-bar > div > div > div > input') as HTMLInputElement;
            if (input) {
                input.removeEventListener('focus', () => { });
                input.removeEventListener('blur', () => { });
                input.removeEventListener('input', () => { });
            }
        };
    }, []);

    useEffect(() => {
        const checkSearchBarVisibility = () => {
            const searchBarElement = document.querySelector('.searchBarElement');
            const isVisible = !!searchBarElement;
            toggleChartPositionRelativeOverride(isVisible);
        };

        // Initial check
        checkSearchBarVisibility();

        // Set up MutationObserver
        const observer = new MutationObserver(checkSearchBarVisibility);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Clean up
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="ml-auto flex-1 sm:flex-initial w-full max-w-xs">
            <div
                ref={searchRef}
                className="relative top-search-bar"
            >
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
                    placeholder="     Search ..."
                    showIcon={false}
                    inputDebounce={300}
                    fuseOptions={{ keys: ['name', 'moniker'] }}
                />
            </div>
        </div>
    );
}