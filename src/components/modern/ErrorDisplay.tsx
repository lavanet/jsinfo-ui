// src/components/ErrorDisplay.tsx

import Image from 'next/image';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    // If message is longer than 100 characters, log it and return null
    if (!message || (message + "").length > 100 || JSON.stringify(message).length > 100) {
        console.log('Long error message:', message);
        return null;
    }

    if (message === "No data for chart loaded") {
        return (
            <div style={{ color: 'grey' }}>
                No chart data available
            </div>
        );
    }

    if (typeof message !== 'string' || typeof message !== 'number' || typeof message !== 'boolean') {
        message = JSON.stringify(message);
    }

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