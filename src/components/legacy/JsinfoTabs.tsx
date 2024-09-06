// src/components/JsinfoTabs.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tabs } from "@radix-ui/themes";



interface Tab {
    value: string;
    content: React.ReactNode;
}

interface JsinfoTabsProps {
    tabs: Tab[];
    defaultValue: string;
    children: React.ReactNode;
}

const JsinfoTabs: React.FC<JsinfoTabsProps> = ({ tabs, defaultValue, children }) => {
    let hash = window.location.hash.slice(1).toLowerCase();
    const matchingTab = tabs.find(tab => tab.value.toLowerCase() === hash);
    hash = matchingTab ? matchingTab.value : defaultValue;
    const [activeTab, setActiveTab] = useState<string>(hash);

    // Function to update activeTab based on URL hash
    const updateActiveTab = () => {
        const hash = window.location.hash.slice(1);
        const matchingTab = tabs.find(tab => tab.value.toLowerCase() === hash.toLowerCase());

        if (matchingTab) {
            setActiveTab(matchingTab.value);
        }
    };

    // On component mount, check if URL hash matches any tab value
    useEffect(() => {
        updateActiveTab();

        // Add hashchange event listener
        window.addEventListener('hashchange', updateActiveTab, false);

        // Clean up event listener on unmount
        return () => {
            window.removeEventListener('hashchange', updateActiveTab, false);
        };
    }, [tabs, defaultValue]);

    // When activeTab changes, update the URL hash
    useEffect(() => {
        if (activeTab) {
            window.location.hash = activeTab;
        }
    }, [activeTab]);

    return (
        <Tabs.Root defaultValue={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Trigger
                        key={tab.value}
                        value={tab.value}
                        style={{ transition: "transform 0.3s ease-in-out" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.content}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>
            {children}
        </Tabs.Root>
    );
};

export default JsinfoTabs;