// src/components/LoadingIndicator.tsx

import React from 'react';
import Image from 'next/image';

const styles = {
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '20px',
  },
  image: {
    marginLeft: '5px',
  },
};

interface LoadingIndicatorProps {
  loadingText?: string;
  width?: number;
  height?: number;
}

function LoadingIndicator({ loadingText = 'Loading', width = 20, height = 20 }: LoadingIndicatorProps) {
  return (
    <div style={styles.loadingContainer}>
      <span style={{ marginRight: '10px' }}>{loadingText}...</span>
      <Image
        src="https://lava-fe-assets.s3.amazonaws.com/loader-white.gif"
        width={width}
        height={height}
        alt='loader-white'
        className="rounded-full"
      />
    </div>
  );
}

export default LoadingIndicator;