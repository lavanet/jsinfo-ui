// src/common/dateutils.tsx

import { CachedFetchDateRange } from "./types";

const UtilsDebugLogEnabled = false;

function UtilsDebugLog(...args: any[]) {
    if (UtilsDebugLogEnabled) {
        console.log(...args);
    }
}

export function AdjustFromToDateToSixMonthAgo(from: Date, to: Date): { from: Date, to: Date } {
    let today = new Date();
    UtilsDebugLog('Handling date change from:', from, 'to:', to);

    // Swap dates if 'from' is after 'to'
    if (from.getTime() > to.getTime()) {
        [from, to] = [to, from];
        UtilsDebugLog('Swapped dates. From:', from, 'To:', to);
    }

    // Limit 'from' to 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    if (from.getTime() < sixMonthsAgo.getTime()) {
        from = sixMonthsAgo;
        UtilsDebugLog('Adjusted "from" date to 6 months ago:', from);
    }

    // Limit 'to' to today
    if (to.getTime() > today.getTime()) {
        to = new Date(today);
        UtilsDebugLog('Adjusted "to" date to today:', to);
    }

    // Ensure 'from' and 'to' are at least 6 days apart
    const diffInDays = Math.ceil(Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    UtilsDebugLog('Difference in days:', diffInDays);
    if (diffInDays < 6) {
        from = new Date(to.getTime());
        from.setDate(to.getDate() - 6);
        UtilsDebugLog('Adjusted "from" date to ensure at least 6 days difference:', from);
    }

    return { from, to };
}

export function ConvertJsInfoServerFormatedDateToJsDateObject(dateStr: string): Date {
    UtilsDebugLog(`Parsing date: ${dateStr}`);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let day: number, month: number, year: number;

    // Regular expression to match the day, month, and optional year parts of the date string
    const regex = new RegExp(`(\\d+)(${monthNames.join('|')})(\\d*)`);
    const matches = regex.exec(dateStr);

    if (!matches) {
        const error = new Error(`Failed to parse date: ${dateStr}`);
        UtilsDebugLog(error);
        throw error;
    }

    day = parseInt(matches[1], 10);
    if (isNaN(day) || day < 1 || day > 31) {
        const error = new Error(`Invalid day: ${matches[1]}`);
        UtilsDebugLog(error);
        throw error;
    }

    month = monthNames.indexOf(matches[2]);
    if (month === -1) {
        const error = new Error(`Invalid month: ${matches[2]}`);
        UtilsDebugLog(error);
        throw error;
    }

    year = matches[3] ? 2000 + parseInt(matches[3], 10) : new Date().getFullYear();
    if (isNaN(year) || year < 2000 || year > 2099) {
        const error = new Error(`Invalid year: ${matches[3]}`);
        UtilsDebugLog(error);
        throw error;
    }

    UtilsDebugLog(`Parsed day: ${day}, month: ${month}, year: ${year}`);
    return new Date(year, month, day);
}

export const ConvertDateToServerQueryDate = (date: Date | string | null | undefined) => {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
        return date;
    } else {
        return null;
    }
};

export const WrapSetDatesWithFormatingAnd6MonthFromLimit = (
    setDates: React.Dispatch<React.SetStateAction<CachedFetchDateRange>>,
    initialRange: CachedFetchDateRange
) => {
    return (from: Date, to: Date) => {
        // Use the AdjustFromToDateToSixMonthAgo function to adjust the from and to dates
        const { from: adjustedFrom, to: adjustedTo } = AdjustFromToDateToSixMonthAgo(from, to);

        const fromFormatted = ConvertDateToServerQueryDate(adjustedFrom);
        const toFormatted = ConvertDateToServerQueryDate(adjustedTo);

        if (fromFormatted && toFormatted) {
            const diffInDays = Math.ceil(
                Math.abs(new Date(toFormatted).getTime() - new Date(fromFormatted).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffInDays < 1) {
                setDates(initialRange);
            } else {
                const newDates = {
                    from: new Date(fromFormatted),
                    to: new Date(toFormatted)
                };
                setDates(newDates);
            }
        }
    };
};