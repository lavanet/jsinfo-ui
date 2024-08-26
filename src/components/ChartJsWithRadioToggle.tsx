// src/components/ChartJsWithRadioToggle.tsx

"use client"

import React, { useRef, useEffect, RefObject, useState } from 'react';
import { Box, Card } from '@radix-ui/themes';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import RangeDatePicker from "@jsinfo/components/RangeDatePicker";
import { ChartJsLineChartData, ChartJsLineChartOptions } from './ChartJsReactiveLineChart';
import { CachedFetchDateRange } from '@jsinfo/common/types';
import RadioToggle from './RadioToggle';

interface ChartJsWithRadioToggleProps {
    data: ChartJsLineChartData;
    options: ChartJsLineChartOptions;
    title: string;
    onDateChange?: (dates: { from: Date, to: Date }) => void;
    datePickerValue?: CachedFetchDateRange;
    rangeOptions: string[];
    rangeOnChange: (value: any) => void;
    noDatePicker?: boolean
    chartKey: string
}

const ChartJsWithRadioToggle: React.FC<ChartJsWithRadioToggleProps> = (
    { data, options, title, onDateChange, datePickerValue, rangeOptions, rangeOnChange, noDatePicker, chartKey }
) => {

    if (!data || typeof data !== 'object') {
        console.error('data is required and should be an object', data);
        throw new Error('data is required and should be an object');
    }

    if (!options || typeof options !== 'object') {
        console.error('options is required and should be an object', options);
        throw new Error('options is required and should be an object');
    }

    if (typeof title !== 'string') {
        console.error('title should be a string', title);
        throw new Error('title should be a string');
    }

    const boxRef: RefObject<HTMLDivElement> = useRef(null);

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => {
            if (boxRef.current) {
                let width = boxRef.current.offsetWidth;
                if (width < 100) {
                    width = 100;
                }
                boxRef.current.style.height = `${width / 2}px`;
            }
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    if (Object.keys(data).length === 0) {
        return (
            <div style={{ padding: '1em', textAlign: 'center' }}>
                <h2 style={{ color: 'grey' }}>Please refresh page to load data</h2>
            </div>
        );
    }

    const hasData = data.datasets.some(dataset => dataset.data.length > 0);

    if (!hasData) {
        const labels = data.datasets.map(dataset => dataset.label).join(', ');

        return (
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1em' }}>
                    <Image
                        width={120}
                        height={120}
                        src="/folder-delete.svg"
                        alt="no-data-available"
                        priority={true}
                    />
                    <h2>No chart data available for:</h2>
                    <h2 style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'grey' }}>{labels}</span>
                    </h2>
                </div>
            </Card>
        );
    }

    let responsiveChartOptions = { ...options, responsive: true };

    if (windowWidth < 1050) {
        return (<Box style={{ width: '100%', maxHeight: '100vh' }}>
            <Card style={{ width: '100%', height: '100%' }}>
                <div style={{ marginBottom: '7px' }}>
                    <Box className="chartjs-reactivechart-title">{title}</Box>
                </div>
                <div>
                    <RadioToggle options={rangeOptions} onChange={rangeOnChange} style={{ marginRight: '10px' }} className='newline' />
                </div>
                {!noDatePicker && (
                    <div style={{ marginLeft: '9px', marginBottom: '10px' }}>
                        <RangeDatePicker onDateChange={onDateChange!} datePickerValue={datePickerValue!} />
                    </div>
                )}
                <div ref={boxRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
                    <Line key={chartKey} data={data} options={responsiveChartOptions}></Line>
                </div>
            </Card>
        </Box >)
    }

    return (
        <Box style={{ width: '100%', maxHeight: '100vh' }}>
            <Card style={{ width: '100%', height: '100%' }}>
                <div style={{ marginBottom: '7px' }}>
                    <Box className="chartjs-reactivechart-title">{title}</Box>
                    <div className="chartjs-reactivechart-controls">
                        <RadioToggle options={rangeOptions} onChange={rangeOnChange} style={{ marginRight: '10px' }} className='inline' />
                        {!noDatePicker && (
                            <RangeDatePicker onDateChange={onDateChange!} datePickerValue={datePickerValue!} />
                        )}
                    </div>
                </div>
                <div ref={boxRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
                    <Line key={chartKey} data={data} options={responsiveChartOptions}></Line>
                </div>
            </Card>
        </Box >
    );
};

export default ChartJsWithRadioToggle;