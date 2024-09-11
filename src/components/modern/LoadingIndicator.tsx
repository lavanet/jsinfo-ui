// src/components/modern/LoadingIndicator.tsx

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
  greyText: {
    color: 'grey',
  },
};

interface LoadingIndicatorProps {
  loadingText?: string;
  greyText?: string;
  width?: number;
  height?: number;
}

function LoadingIndicator({ loadingText = 'Loading', greyText = '', width = 20, height = 20 }: LoadingIndicatorProps) {
  // Split the loadingText and greyText into words
  const loadingWords = loadingText.split(' ');
  const greyWords = greyText.split(' ');

  return (
    <div style={{ ...styles.loadingContainer, marginBottom: '8px' }}>
      <span style={{ marginRight: '15px' }}>
        {loadingWords.map((word, index) => (
          <span key={index} style={greyWords.includes(word) ? styles.greyText : {}}>
            {word}
            {/* Add a space after each word except the last one */}
            {index < loadingWords.length - 1 && ' '}
          </span>
        ))}
        ...
      </span>
      <Image
        src="https://lava-fe-assets.s3.amazonaws.com/loader-white.gif"
        width={width}
        height={height}
        alt='loader-white'
        className="rounded-full"
        unoptimized={true}
      />
    </div>
  );
}

export default LoadingIndicator;