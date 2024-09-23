// src/common/formatting.tsx

const formatter = new Intl.NumberFormat('en-US');
export function FormatNumber(value: number): string {
    return formatter.format(value)
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

export function FormatNumberKMB(input: string | null): string {
    if (!input) return "0";

    let str = input.toString().replace(/,/g, "");

    let numberPart = str.split(" ")[0];

    let number = parseFloat(numberPart);

    if (isNaN(number)) return "0";

    let suffix = '';
    if (number >= 1e9) {
        suffix = 'B';
        number /= 1e9;
    } else if (number >= 1e6) {
        suffix = 'M';
        number /= 1e6;
    } else if (number >= 1e3) {
        suffix = 'K';
        number /= 1e3;
    }

    let roundedNumber = parseFloat(number.toFixed(2));

    return FormatNumber(roundedNumber) + suffix;
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