// src/components/StatusCell.tsx

import React, { CSSProperties } from 'react';

export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'
interface StatusCallProps {
    status: string;
    style?: CSSProperties;
}

const StatusCall: React.FC<StatusCallProps> = ({ status, style }) => {
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
            case "degraded":
                return "yellow";
            default:
                return null;
        }
    }

    const color = statusColor(status);

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const iconSrc = color === "green" ? "/circle-green.svg" :
        color === "grey" ? "/circle-grey.svg" :
            color === "red" ? "/circle-red.svg" :
                color === "yellow" ? "/circle-yellow.svg" :
                    "/circle-grey.svg";

    return color ? (
        <span style={{ color: color, whiteSpace: 'nowrap', ...style }}>
            <img
                width={10}
                height={10}
                src={iconSrc}
                alt="status"
                style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '2px' }}
            />
            &nbsp;
            {capitalizedStatus}
        </span>
    ) : <span style={{ whiteSpace: 'nowrap', ...style }}>{capitalizedStatus}</span>;
};

export default StatusCall;