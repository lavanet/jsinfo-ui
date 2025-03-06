"use client";

import React, { useState, createContext, useContext, ReactNode } from 'react';
import { cn } from '@jsinfo/lib/css';

// Custom Tabs implementation
interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ value: "", onValueChange: () => { } });

interface TabsProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
}

export function Tabs({
    value,
    defaultValue,
    onValueChange,
    children,
    className
}: TabsProps) {
    const [tabValue, setTabValue] = useState(value || defaultValue || "");

    const handleValueChange = (newValue: string) => {
        setTabValue(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider
            value={{
                value: value !== undefined ? value : tabValue,
                onValueChange: onValueChange || handleValueChange
            }}
        >
            <div className={cn("space-y-2", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled = false }: TabsTriggerProps) {
    const { value: contextValue, onValueChange } = useContext(TabsContext);
    const isActive = contextValue === value;

    return (
        <button
            disabled={disabled}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-muted-foreground/10",
                className
            )}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: contextValue } = useContext(TabsContext);
    const isActive = contextValue === value;

    if (!isActive) return null;

    return (
        <div
            role="tabpanel"
            data-state={isActive ? "active" : "inactive"}
            className={cn("mt-2", className)}
        >
            {children}
        </div>
    );
}