// src/components/NavbarSearch.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useCachedFetch } from '@jsinfo/hooks/useCachedFetch';
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
    const { data, loading, error } = useCachedFetch({ dataKey: "autoCompleteLinksHandler" });

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
                <span style={{ display: 'block', textAlign: 'left', fontSize: '1.3em', color: 'grey' }}>
                    {type}: {name}
                </span>
                {moniker && (
                    <span style={{ display: 'block', textAlign: 'left', fontSize: '1.3em', color: 'grey' }}>
                        Moniker: {moniker}
                    </span>
                )}
            </>
        );
    }
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [preventChange, setPreventChange] = useState(false);

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const focusTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            if (focusTimeout.current) clearTimeout(focusTimeout.current);
        };
    }, []);

    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.querySelector('button');

        const navbarButtons = document.getElementById('NavBarButtons');
        if (navbarButtons) {
            if ((isHovered || isFocused) && windowWidth <= 650) {
                navbarButtons.style.opacity = '0';
                navbarButtons.style.visibility = 'hidden';
            } else {
                navbarButtons.style.opacity = '1';
                navbarButtons.style.visibility = 'visible';
            }
        }

        let width = "800px"
        if (windowWidth <= 600) {
            width = (windowWidth / 0.8 - 35) + "px";
        } else if (windowWidth <= 650) {
            width = (windowWidth - 35) + "px";
        } else if (windowWidth <= 1000) {
            const eventsbtn = document.querySelector('#eventsbtn')
            if (!eventsbtn) return;
            width = (windowWidth - eventsbtn.getBoundingClientRect().right - 30) + "px";
        }

        if (searchRef.current) {
            if (isHovered || isFocused) {
                searchRef.current.style.width = width
                searchRef.current.style.maxWidth = ''
            } else {
                if (windowWidth <= 650) {
                    searchRef.current.style.width = '150px'
                    searchRef.current.style.maxWidth = '150px'
                } else {
                    searchRef.current.style.width = '300px'
                    searchRef.current.style.maxWidth = ''
                }
            }
        }
        if (!preventChange) if (!(isFocused || isHovered)) {
            deFocus()
        }
    }, [windowWidth, isHovered, isFocused]);

    function deFocus() {
        setPreventChange(true);
        setTimeout(() => setPreventChange(false), 300);
        const searchElement = document.querySelector('button');
        (searchElement as HTMLButtonElement)?.focus();
        (searchElement as HTMLButtonElement)?.blur();
        document.body.focus();
        setIsHovered(false);
        setIsFocused(false);
        if (searchRef.current) {
            searchRef.current.style.width = '300px';
        }
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
