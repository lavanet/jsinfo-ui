import React, { useRef, useEffect } from 'react';
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

  const boxRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (boxRef.current) {
        const width = boxRef.current.offsetWidth;
        boxRef.current.style.height = `${width / 2}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
