// src/components/NavbarSearch.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useApiFetch } from '@jsinfo/hooks/useApiFetch';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { usePageContext } from '@jsinfo/context/PageContext';

export function NavbarSearch() {
    interface Item {
        id: string;
        name: string;
        type: string;
        link: string;
        moniker: string;
    }

    let items: Item[] = [];
    const { data, loading, error } = useApiFetch("autoCompleteLinksHandler");

    if (!error && !loading && data.data) {
        items = data.data;

        let idMap: { [id: string]: number } = {};

        for (let i = 0; i < items.length; i++) {
            let id = items[i].id;
            if (idMap[id] != null) {
                idMap[id]++;
                items[i].id = `${id}-${idMap[id]}`;
            } else {
                idMap[id] = 0;
            }
        }
    }

    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleOnSelect = (item: Item | string) => {
        if (typeof item === 'string') {
            if (item.length < 2) {
                return;
            }

            const foundItem = items.find(i => i.name.toLowerCase() === item.toLowerCase() || i.moniker.toLowerCase() === item.toLowerCase());

            if (foundItem) {
                router.push(foundItem.link);
            }
        } else {
            router.push(item.link);
        }
    }

    const formatResult = (item: Item) => {
        const type = `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}`;
        const name = item.name;
        const moniker = item.moniker;

        return (
            <>
                <span className="searchBarElement">
                    {type}: {name}
                </span>
                {moniker && (
                    <span className="searchBarElement">
                        Moniker: {moniker}
                    </span>
                )}
            </>
        );
    }
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [preventChange, setPreventChange] = useState(false);


    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const focusTimeout = useRef<NodeJS.Timeout | null>(null);


    const searchRef = useRef<HTMLDivElement>(null);

    function deFocus() {
        if (typeof document === 'undefined') return;
        setPreventChange(true);
        setTimeout(() => setPreventChange(false), 300);
        const searchElement = document.querySelector('button');
        (searchElement as HTMLButtonElement)?.focus();
        (searchElement as HTMLButtonElement)?.blur();
        document.body.focus();
        setIsHovered(false);
        setIsFocused(false);
    }

    useEffect(() => {
        const inputElement: HTMLInputElement | null = document.querySelector('.search input[data-test="search-input"]');
        if (!inputElement) return;
        (inputElement as any)["data-lpignore"] = 'true';
        (inputElement as any)["spellcheck"] = 'false';
        inputElement.addEventListener('keydown', function (event: KeyboardEvent) {
            if (event.key === 'Enter') {
                const inputValue = (event.target as HTMLInputElement).value;
                handleOnSelect(inputValue);
            }
            if (event.key === 'Escape') {
                deFocus()
            }
        });

    }, []);

    const { currentPage } = usePageContext();

    useEffect(() => {
        deFocus();
    }, [currentPage]);

    return (
        <div
            ref={searchRef}
            className={`search ${items && items.length > 0 ? '' : 'hidden'}`}
            onMouseEnter={() => {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                if (!preventChange) setIsHovered(true);
            }}
            onMouseLeave={() => {
                hoverTimeout.current = setTimeout(() => setIsHovered(false), 200);
            }}
            onFocus={() => {
                if (focusTimeout.current) clearTimeout(focusTimeout.current);
                if (!preventChange) setIsFocused(true);
            }}
            onBlur={() => {
                focusTimeout.current = setTimeout(() => setIsFocused(false), 200);
            }}
        >
            <ReactSearchAutocomplete
                items={items}
                onSelect={handleOnSelect}
                formatResult={formatResult}
                maxResults={10}
            />
        </div>
    );
}
