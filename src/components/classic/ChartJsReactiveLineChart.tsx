// src/components/ChartJsReactiveLineChart.tsx
"use client"

import React, { useRef, useEffect, RefObject } from 'react';
import { Box, Card } from '@radix-ui/themes';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import RangeDatePicker from "@jsinfo/components/classic/RangeDatePicker";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ChartDataset,
  ScriptableContext,
  PointStyle,
} from 'chart.js';

import { CachedFetchDateRange } from '@jsinfo/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);


export const CHARTJS_COLORS = [
  "#ff3900",
  "#ff1d70",
  "#ec25f4",
  "#7679ff",
  "#0082fb",
  "#00d7b0",
  "#0eba53",
  "#ffbc0a",
  "#b54548",
  "#e5484d",
  "#ec5d5e",
  "#ff9592",
  "#ffd1d9",
];

export interface ChartJsLinePoint {
  x: number | string | Date;
  y: number | string;
}

export type ChartJsLineChartData = ChartData<"line", (ChartJsLinePoint)[], unknown>;
export type ChartJsLineChartDataset = ChartDataset<"line", (ChartJsLinePoint)[]>;

export interface ChartJsLineChartOptions extends ChartOptions<"line"> {
  stacked?: boolean;
}

export interface ChartJsSpecIdToDatasetMap {
  [key: string]: ChartJsLineChartDataset
}

export type ChartJsLineScriptableContext = ScriptableContext<"line">

interface ChartJsReactiveLineChartProps {
  data: ChartJsLineChartData;
  options: ChartJsLineChartOptions;
}

export const ChartJsReactiveLineChart: React.FC<ChartJsReactiveLineChartProps> = ({ data, options }) => {
  if (!data || typeof data !== 'object') {
    console.error('data is required and should be an object', data);
    throw new Error('data is required and should be an object');
  }

  if (!options || typeof options !== 'object') {
    console.error('options is required and should be an object', options);
    throw new Error('options is required and should be an object');
  }

  const boxRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    let lastWidth = 0;

    const handleResize = () => {
      if (boxRef.current) {
        let width = boxRef.current.offsetWidth;
        if (width < 100) {
          width = 100;
        }
        if (width !== lastWidth) {
          boxRef.current.style.height = `${width / 2}px`;
          lastWidth = width;
        }
      }
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

  // Todo: chart labels are showing up on top of the chart on mobile
  return (
    <Box ref={boxRef} style={{ width: '100%', maxHeight: '100vh' }}>
      <Card style={{ width: '100%', height: '100%' }}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Line data={data} options={responsiveChartOptions}></Line>
        </div>
      </Card>
    </Box>
  );
};

interface ChartJsReactiveLineChartPropsWithDatePicker {
  data: ChartJsLineChartData;
  options: ChartJsLineChartOptions;
  title?: string;
  onDateChange: (dates: { from: Date, to: Date }) => void;
  datePickerValue: CachedFetchDateRange;
  rightControl?: JSX.Element | null;
}

export const ChartJsReactiveLineChartWithDatePicker: React.FC<ChartJsReactiveLineChartPropsWithDatePicker> = (
  { data, options, title, onDateChange, datePickerValue, rightControl }
) => {

  if (!data || typeof data !== 'object') {
    console.error('data is required and should be an object', data);
    throw new Error('data is required and should be an object');
  }

  if (!options || typeof options !== 'object') {
    console.error('options is required and should be an object', options);
    throw new Error('options is required and should be an object');
  }

  if (title && typeof title !== 'string') {
    console.error('title should be a string', title);
    throw new Error('title should be a string');
  }

  if (!onDateChange || typeof onDateChange !== 'function') {
    console.error('onDateChange is required and should be a function', onDateChange);
    throw new Error('onDateChange is required and should be a function');
  }

  if (!datePickerValue || typeof datePickerValue !== 'object') {
    console.error('datePickerValue is required and should be an object', datePickerValue);
    throw new Error('datePickerValue is required and should be an object');
  }

  if (rightControl && typeof rightControl !== 'object') {
    console.error('rightControl should be a JSX.Element or null', rightControl);
    throw new Error('rightControl should be a JSX.Element or null');
  }

  const boxRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (boxRef.current) {
        let width = boxRef.current.offsetWidth;
        if (width < 100) {
          width = 100;
        }
        boxRef.current.style.height = `${width / 2}px`;
      }
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

  return (
    <Box style={{ width: '100%', maxHeight: '100vh' }}>
      <Card style={{ width: '100%', height: '100%' }}>
        <div style={{ marginBottom: '7px' }}>
          {title && <Box className="chartjs-reactivechart-title">{title}</Box>}
          <div className="chartjs-reactivechart-controls">
            {rightControl ? rightControl : null}
            <RangeDatePicker onDateChange={onDateChange} datePickerValue={datePickerValue} />
          </div>
        </div>
        <div ref={boxRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Line data={data} options={responsiveChartOptions}></Line>
        </div>
      </Card>
    </Box >
  );
};

export function ChartjsSetLastDotHighInChartData(chartData: ChartJsLineChartData): void {
  chartData.datasets.forEach((dataset) => {
    if (!dataset.data || dataset.data.length < 3) return;

    // Calculate the average of all but the last data point
    const allButLastPoints = dataset.data.slice(0, -1);
    const averageAllButLast = allButLastPoints.reduce((acc, point) => acc + (Number(point.y) || 0), 0) / allButLastPoints.length;

    // Calculate the maximum y value of the last three data points
    const lastThreePoints = dataset.data.slice(-3);
    const maxOfLastThree = Math.max(...lastThreePoints.map(point => Number(point.y) || 0));

    // Set the last data point's y to the maximum of its current value or the maxOfLastThree
    const lastPoint = dataset.data[dataset.data.length - 1];
    lastPoint.y = Math.max(averageAllButLast * 0.6, maxOfLastThree);
  });
}

export function ChartjsSetLastPointToLineInChartOptions(chartOptions: ChartJsLineChartOptions): ChartJsLineChartOptions {
  if (!chartOptions.elements) {
    chartOptions.elements = {};
  }

  if (!chartOptions.elements.point) {
    chartOptions.elements.point = {};
  }

  if (!chartOptions.elements.point.radius) {
    chartOptions.elements.point.radius = function (context: ChartJsLineScriptableContext): number {
      const index = context.dataIndex;
      const count = context.dataset.data.length;
      return index === count - 1 ? 2 : 1;
    };
  }

  if (!chartOptions.elements.point.pointStyle) {
    chartOptions.elements.point.pointStyle = function (context: ChartJsLineScriptableContext): PointStyle {
      const index = context.dataIndex;
      const count = context.dataset.data.length;
      return index === count - 1 ? "dash" : "circle";
    };
  }

  return chartOptions;
}