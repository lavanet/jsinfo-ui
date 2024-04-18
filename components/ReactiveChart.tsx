// jsinfo-ui/components/reactivechart.tsx

import React, { useRef, useEffect, RefObject } from 'react';
import { Box, Card } from '@radix-ui/themes';
import { Line } from 'react-chartjs-2';

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
} from 'chart.js';

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

export const ReactiveChart = ({ data, options }) => {
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
        <div style={{ padding: '1em', textAlign: 'center' }}>
          <img width="120" height="120" src="/folder-delete.svg" alt="no-data-availible" />
          <h2 style={{ marginLeft: '5px', marginTop: '-30px' }}>No chart data available for:</h2>
          <h2 style={{ marginTop: '-10px' }}><span style={{ color: 'grey' }}>{labels}</span></h2>
        </div>
      </Card>
    );
  }

  const responsiveChartOptions = { ...options, responsive: true };

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