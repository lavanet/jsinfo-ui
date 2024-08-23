// src/components/LoadingImageForCards.tsx

import React from 'react';
import Image from 'next/image';

export default function LoaderImageForCards() {
    return (
        <Image
            src="https://lava-fe-assets.s3.amazonaws.com/loader-white.gif"
            width={20}
            height={20}
            alt='loader-white'
            className="rounded-full"
            unoptimized={true}
        />
    );
}