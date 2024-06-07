// src/components/ErrorDisplay.tsx

import Image from 'next/image';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    return (
        <div>
            <Image
                width={36}
                height={36}
                src="/error-badge.svg"
                alt="error-icon"
                style={{ display: 'inline-block', verticalAlign: 'middle', margin: '-5px', paddingBottom: '2px' }}
            />
            <span style={{ color: 'red' }}>Error:&nbsp;</span>{message}
        </div>
    );
}