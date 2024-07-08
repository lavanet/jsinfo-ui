// src/components/ChartJsReactiveLineChart.tsx
"use client"




import React, { useRef, useEffect, RefObject } from 'react';
import { Box, Card } from '@radix-ui/themes';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import RangeDatePicker from "@jsinfo/components/RangeDatePicker";

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

import { CachedFetchDateRange } from '@jsinfo/common/types';

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
  onDateChange: (from: Date, to: Date) => void;
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

  // Todo: chart labels are showing up on top of the chart on mobile
  return (
    <Box style={{ width: '100%', maxHeight: '100vh' }}>
      <Card style={{ width: '100%', height: '100%' }}>
        <div style={{ marginBottom: '5px' }}>
          {title && <Box style={{ float: 'left', marginLeft: '11px', userSelect: 'text' }}>{title}</Box>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {rightControl ? rightControl : null}
            <RangeDatePicker onDateChange={onDateChange} datePickerValue={datePickerValue} />
          </div>
        </div>
        <div ref={boxRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Line data={data} options={responsiveChartOptions}></Line>
        </div>
      </Card>
    </Box>
  );
};

export function ChartjsSetLastDotHighInChartData(chartData: ChartJsLineChartData): void {
  chartData.datasets.forEach((dataset: ChartJsLineChartDataset, datasetIndex: number) => {
    if (!dataset.data || dataset.data.length === 0) {
      return;
    }
    const previousDataPoints = dataset.data.slice(0, -1);
    const sortedDataPoints = previousDataPoints.sort((a: ChartJsLinePoint, b) => {
      if (a.y === undefined || b.y === undefined) {
        console.info(
          `ChartjsSetLastDotHighInChartData:: Data point's y property is undefined. Data points: ${JSON.stringify(
            a
          )}, ${JSON.stringify(b)}`
        );
        return 0;
      }
      return parseFloat(a.y + "") - parseFloat(b.y + "");
    });

    const lowerThirdIndex = Math.floor(sortedDataPoints.length / 1.5);
    const adjustedDataPoints = sortedDataPoints.slice(lowerThirdIndex);

    let median;
    if (adjustedDataPoints.length % 2 === 0) {
      const midIndex1 = adjustedDataPoints.length / 2 - 1;
      const midIndex2 = adjustedDataPoints.length / 2;

      if (
        !adjustedDataPoints[midIndex1] ||
        adjustedDataPoints[midIndex1].y === undefined ||
        !adjustedDataPoints[midIndex2] ||
        adjustedDataPoints[midIndex2].y === undefined
      ) {
        console.info(
          "ChartjsSetLastDotHighInChartData:: adjustedDataPoints does not have valid elements at indices " +
          midIndex1 +
          " and " +
          midIndex2 +
          ". adjustedDataPoints: ",
          adjustedDataPoints
        );
        return;
      }

      median =
        (parseFloat(adjustedDataPoints[midIndex1].y + "") +
          parseFloat(adjustedDataPoints[midIndex2].y + "")) /
        2;
    } else {
      median = parseFloat(adjustedDataPoints[(adjustedDataPoints.length - 1) / 2].y + "");
    }

    const lastDataPoint = dataset.data[dataset.data.length - 1];

    if (!lastDataPoint) {
      console.info(
        `ChartjsSetLastDotHighInChartData:: The last data point in dataset ${datasetIndex} is undefined.`
      );
      return;
    }

    if (lastDataPoint.y === undefined) {
      console.info(
        `ChartjsSetLastDotHighInChartData:: The last data point's y property in dataset ${datasetIndex} is undefined. Data point: ${JSON.stringify(
          lastDataPoint
        )}`
      );
      return;
    }

    if (dataset.data.length < 3) {
      lastDataPoint.y = Math.max(median, parseFloat(lastDataPoint.y + ""));
    } else {
      const secondLastDataPoint = dataset.data[dataset.data.length - 2];
      const thirdLastDataPoint = dataset.data[dataset.data.length - 3];

      if (!secondLastDataPoint || !thirdLastDataPoint) {
        console.info(
          `ChartjsSetLastDotHighInChartData:: One of the last three data points in dataset ${datasetIndex} is undefined.`
        );
        return;
      }

      if (
        secondLastDataPoint.y === undefined ||
        thirdLastDataPoint.y === undefined
      ) {
        console.info(
          `ChartjsSetLastDotHighInChartData:: One of the last three data points' y property in dataset ${datasetIndex} is undefined. Data points: ${JSON.stringify(
            secondLastDataPoint
          )}, ${JSON.stringify(thirdLastDataPoint)}`
        );
        return;
      }

      const previousDataPointAverage =
        (parseFloat(secondLastDataPoint.y + "") +
          parseFloat(thirdLastDataPoint.y + "") +
          parseFloat(lastDataPoint.y + "")) /
        3;

      lastDataPoint.y = Math.max(median, previousDataPointAverage);
    }
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