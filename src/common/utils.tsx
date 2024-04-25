// src/common/utils.tsx

import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
import { SortAndPaginationConfig, SortConfig } from "./types";

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
      return "";
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