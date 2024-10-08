// src/components/modern/TimeTooltip.tsx

import { FormatTimeDifference } from '../../lib/formatting';
import ModernTooltip from './ModernTooltip';

interface TimeTooltipProps {
    datetime: Date | string;
}

function TimeTooltip({ datetime }: TimeTooltipProps) {
    if (!datetime) {
        return "invalid datetime:" + datetime;
    }

    const date = typeof datetime === 'string' || typeof datetime === 'number' ? new Date(datetime) : datetime;

    function formatToISO(date: Date, datetime: Date | string): string {
        if (date) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString().slice(2);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}` + " UTC";
        } else {
            return datetime + "";
        }
    }

    return (
        <ModernTooltip title={formatToISO(date, datetime)}>
            {FormatTimeDifference(date)}
        </ModernTooltip>
    );

}

export default TimeTooltip;