// src/common/utils.tsx

import { SortAndPaginationConfig, SortConfig } from "./types";
import { Card } from "@radix-ui/themes";

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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutesAgo = Math.floor(diffMs / 60000);

  if (minutesAgo < 60) {
    return `${minutesAgo}min ago`;
  } else if (minutesAgo < 1440) {
    let hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}hrs ago`;
  }
  let daysAgo = Math.floor(minutesAgo / 1440);
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
