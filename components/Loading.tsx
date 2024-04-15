// components/loading.tsx

import React from 'react';

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

interface LoadingProps {
  loadingText?: string;
  width?: number;
  height?: number;
}

function Loading({ loadingText = 'Loading', width = 20, height = 20 }: LoadingProps) {
  return (
    <div style={styles.loadingContainer}>
      <span>{loadingText}...</span>
      <img
        style={styles.image}
        src="https://lava-fe-assets.s3.amazonaws.com/loader-white.gif"
        width={width}
        height={height}
        alt={'loader-white'}
        className="rounded-full"
      />
    </div>
  );
}

export default Loading;