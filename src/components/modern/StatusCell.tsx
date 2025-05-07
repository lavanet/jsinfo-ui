// src/components/modern/StatusCell.tsx

import React, { CSSProperties } from 'react';

interface StatusCallProps {
    status: string;
    style?: CSSProperties;
}

const StatusCall: React.FC<StatusCallProps> = ({ status, style }) => {
    const statusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();

        // Check for both the raw API value and our internal code value
        if (lowerStatus === "active" ||
            lowerStatus === "healthy" ||
            lowerStatus === "version_upgrade_available" ||
            lowerStatus === "upgrade available") {
            return "green";
        }
        if (lowerStatus === "frozen" ||
            lowerStatus === "unhealthy" ||
            lowerStatus === "jailed") {
            return "red";
        }
        if (lowerStatus === "unstaking" ||
            lowerStatus === "unstaked" ||
            lowerStatus === "version_upgrade_required" ||
            lowerStatus === "upgrade required") {
            return "orange";
        }
        if (lowerStatus === "inactive") {
            return "grey";
        }
        if (lowerStatus === "degraded") {
            return "yellow";
        }
        return null;
    }

    const color = statusColor(status);

    const formatStatus = (status: string) => {
        const lowerStatus = status.toLowerCase();

        // Special cases that should be consistently formatted regardless of input format
        if (lowerStatus === 'version_upgrade_available' || lowerStatus === 'upgrade available') {
            return 'Upgrade Available';
        } else if (lowerStatus === 'version_upgrade_required' || lowerStatus === 'upgrade required') {
            return 'Upgrade Required';
        }

        // General formatting for other statuses
        if (status.includes('_')) {
            return status.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        } else {
            return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }
    };

    const displayStatus = formatStatus(status);

    const getIconColor = () => {
        // First use the detected color if available
        if (color) return color;

        // Otherwise check text for upgrade keywords
        if (status.toLowerCase().includes('upgrade')) {
            return status.toLowerCase().includes('required') ? 'orange' : 'green';
        }

        // Default fallback
        return 'grey';
    };

    const iconColor = getIconColor();
    const iconSrc = iconColor === "green" ? "/circle-green.svg" :
        iconColor === "grey" ? "/circle-grey.svg" :
            iconColor === "red" ? "/circle-red.svg" :
                iconColor === "yellow" ? "/circle-yellow.svg" :
                    iconColor === "orange" ? "/circle-orange.svg" :
                        "/circle-grey.svg";

    return (
        <span style={{
            color: color || (status.toLowerCase().includes('upgrade') ? 'green' : 'inherit'),
            whiteSpace: 'nowrap',
            ...style
        }}>
            <img
                width={10}
                height={10}
                src={iconSrc}
                alt="status"
                style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '2px' }}
            />
            &nbsp;
            {displayStatus}
        </span>
    );
};

export default StatusCall;