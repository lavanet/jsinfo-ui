// src/app/provider/[lavaid]/_components/ProviderPerSpecRelaysPieChart.tsx

"use client"

import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import { Card, CardContent, CardHeader, CardTitle } from "@jsinfo/components/shadcn/ui/Card"
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ErrorDisplay } from "@jsinfo/components/modern/ErrorDisplay";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { Skeleton } from "@jsinfo/components/shadcn/ui2/Skeleton";
import { Loader2 } from "lucide-react";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

interface ChartDataItem {
    id: number;
    value: string;
    label: string;
}

export function ProviderPerSpecRelaysPieChart({ lavaId }: { lavaId: string }) {
    const { data, loading, error } = useApiFetch(`providerRelaysPerSpecPie/${lavaId}`);

    if (error) return <ErrorDisplay message={error} />;

    if (loading) {
        return (
            <Card className="flex flex-col w-fit" style={{ height: '330px', width: '350px' }}>
                <CardHeader className="items-center pb-0">
                    <CardTitle>
                        <div className="text-[15px] mb-1">Relays per Spec</div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[180px]" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const relaysPerSpec = data?.chartData.reduce((acc: any, item: any) => {
        acc[item.label] = parseInt(item.value);
        return acc;
    }, {} as Record<string, number>) || {};


    const renderContent = () => {

        const chartData: ChartDataItem[] = data?.chartData || [];
        const total = chartData.reduce((sum: number, item: ChartDataItem) => sum + parseInt(item.value), 0);

        const pieData = chartData.map(item => ({
            ...item,
            value: (parseInt(item.value) / total) * 100
        }));

        const valueFormatter = (value: any) => {
            const originalValue = relaysPerSpec[value.label];
            return `${parseInt(originalValue).toLocaleString()} relays`;
        };

        return (
            <PieChart
                series={[
                    {
                        arcLabel: (item) => `${item.value.toFixed(1)}%`,
                        arcLabelMinAngle: 45,
                        data: pieData,
                        valueFormatter,
                    },
                ]}
                margin={{ top: 10, bottom: 50, left: 10, right: 10 }}
                height={300}
                width={300}
                slotProps={{
                    legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                        padding: 0,
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        markGap: 5,
                        itemGap: 10,
                        labelStyle: {
                            fill: '#FAFAFA',
                            fontSize: 12,
                        },
                    },
                }}
                tooltip={{
                    trigger: 'item'
                }}
            />
        );
    };

    return (
        <Card className="flex flex-col w-fit" style={{ height: '360px' }}>
            <CardHeader className="items-center pb-0">
                <CardTitle>
                    <div className="text-[15px] mb-1">Relays per Spec</div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    {renderContent()}
                </ThemeProvider>
            </CardContent>
        </Card>
    );
}

