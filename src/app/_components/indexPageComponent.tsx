// src/app/_components/indexPageComponent.tsx

import React from "react";
import { Flex, Card, Box } from "@radix-ui/themes";
import JsinfoTabs from "@jsinfo/components/JsinfoTabs";
import IndexChart from "@jsinfo/charts/indexChart";
import { IndexAllCards, LatestBlockCard } from "./indexPageCards";
import IndexChainsTab from "./indexChainsTab";
import IndexProvidersTab from "./indexProvidersTab";

export const IndexPageComponent: React.FC = () => {
    return (
        <>
            <LatestBlockCard />

            <div style={{ marginTop: 'var(--box-margin)', marginBottom: 'var(--box-margin)' }}>
                <Flex gap="3" justify="between" className="grid grid-cols-2 md:grid-cols-3">
                    <IndexAllCards />
                </Flex>
            </div>

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