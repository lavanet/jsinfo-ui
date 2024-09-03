// src/app/_components/IndexPageComponent.tsx

import React from "react";
import { Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/legacy/JsinfoTabs";
import IndexChart from "@jsinfo/components/charts/IndexChart";
import { IndexAllCards } from "./IndexPageCards";
import IndexChainsTab from "./IndexChainsTab";
import IndexProvidersTab from "./IndexProvidersTab";

export const IndexPageComponent: React.FC = () => {
    return (
        <>
            <IndexAllCards />

            <IndexChart />
            <div className="box-margin-div"></div>

            <Card>
                <JsinfoTabs defaultValue="providers"
                    tabs={[
                        {
                            value: "providers",
                            content: "Providers",
                        },
                        {
                            value: "chains",
                            content: "Chains",
                        },
                    ]}
                >
                    <Box>
                        <IndexProvidersTab />
                        <IndexChainsTab />
                    </Box>
                </JsinfoTabs>
            </Card>
        </>
    );
}