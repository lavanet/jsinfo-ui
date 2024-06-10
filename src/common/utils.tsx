// src/common/utils.tsx

import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
import { CachedFetchDateRange, SortAndPaginationConfig, SortConfig } from "./types";
import { Card } from "@radix-ui/themes";

Dayjs.extend(relativeTIme);

let cachedUrl: string | null = null;

export function GetRestUrl() {
  if (cachedUrl !== null) {
    return cachedUrl;
  }

  const url = process.env["REST_URL"] || process.env["NEXT_PUBLIC_REST_URL"];

  if (!url) {
    throw new Error("REST_URL environment variable is not defined or is an empty string.");
  }

  cachedUrl = url;

  return url;
}

export function GetNestedProperty(obj: Record<string, any>, key: string): any {
  if (key.includes(",")) {
    return key
      .split(",")
      .map((k: string) => GetNestedProperty(obj, k.trim()))
      .join("_");
  }

  return key.split(".").reduce((o: any, i: string) => {
    if (o === null || o === undefined || !o.hasOwnProperty(i)) {
      throw new Error(`Key "${i}" does not exist on object`);
    }
    return o[i];
  }, obj);
}

export const FormatTimeDifference = (date: Date): string => {
  const minutesAgo = Dayjs().diff(Dayjs(date), "minute");
  if (minutesAgo < 60) {
    return `${minutesAgo}min ago`;
  } else if (minutesAgo < 1440) {
    // 1440 minutes in a day
    let hoursAgo = (minutesAgo / 60).toFixed(0);
    return `${hoursAgo}hrs ago`;
  }
  let daysAgo = (minutesAgo / 1440).toFixed(0);
  return `${daysAgo}d ago`;
};

export function ConvertToSortConfig(config: SortAndPaginationConfig): SortConfig {
  return {
    key: config.sortKey,
    direction: config.direction
  };
}

const formatter = new Intl.NumberFormat('en-US');
export function FormatNumber(value: number): string {
  return formatter.format(value)
}

export function FormatNumberWithString(value: string | number): string {
  // Convert value to string before extracting the number part and the string part
  const valueString = value.toString();
  const numberPart = parseFloat(valueString);
  const stringPart = isNaN(numberPart) ? valueString : valueString.replace(numberPart.toString(), '');

  // Apply the formatter to the number part and append the string part
  return !isNaN(numberPart) ? FormatNumber(numberPart) + stringPart : valueString;
}

export function AddSpacesBeforeCapsAndCapitalize(text: string): string {
  // Add a space before capital letters
  let formattedText = text.replace(/([A-Z])/g, ' $1');

  // Capitalize the first letter of each word
  formattedText = formattedText.replace(/\b\w/g, char => char.toUpperCase());

  return formattedText;
}

const UtilsDebugLogEnabled = true;

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

export function RenderInFullPageCard(message: string | React.ReactNode) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '5px', marginRight: '5px', marginBottom: '15px', marginLeft: '5px' }}>
        {message}
      </div>
    </Card>
  );
}

export const IsMeaningfulText = (text: string): boolean => {
  if (!text) {
    return false;
  }

  const trimmedText = text.trim();
  if (trimmedText === '') {
    return false;
  }

  const trimmedTextLower = trimmedText.toLowerCase();
  const meaninglessValues = ['null', 'undefined', 'none', 'n/a', 'na', 'nil', 'false', '0'];
  if (meaninglessValues.includes(trimmedTextLower)) {
    return false
  }

  return true;
};