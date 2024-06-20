// src/components/StatusCell.tsx

import React from 'react';

interface StatusCallProps {
    status: string;
}

const StatusCall: React.FC<StatusCallProps> = ({ status }) => {
    const statusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
            case "healthy":
                return "green";
            case "frozen":
            case "unhealthy":
            case "jailed":
                return "red";
            case "unstaking":
                return "orange";
            case "inactive":
                return "grey";
            case "degredated":
                return "yellow";
            default:
                return null;
        }
    }

    const color = statusColor(status);

    return color ? (
        <span style={{ color: color }}>
            {status}
        </span>
    ) : status;
};

export default StatusCall;

