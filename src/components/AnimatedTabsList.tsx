// src/components/AnimatedTabsList.tsx

import React from "react";
import { Tabs } from "@radix-ui/themes";

interface Tab {
    value: string;
    content: React.ReactNode;
}

interface AnimatedTabsListProps {
    tabs: Tab[];
}

const AnimatedTabsList: React.FC<AnimatedTabsListProps> = ({ tabs }) => {
    return (
        <Tabs.List style={{ overflow: "hidden" }}>
            {tabs.map((tab) => (
                <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    style={{ transition: "transform 0.3s ease-in-out" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    {tab.content}
                </Tabs.Trigger>
            ))}
        </Tabs.List>
    );
};

export default AnimatedTabsList;