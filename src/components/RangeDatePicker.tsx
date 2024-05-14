// src/components/RangeDatePicker.tsx
import DateRangePicker, { DateRange, RangeType } from 'rsuite/DateRangePicker';
import { DateRange as DictDateRange } from "@jsinfo/hooks/useCachedFetch";
const { allowedRange } = DateRangePicker;

import { subDays, startOfWeek, startOfMonth, startOfYear, addMonths, subMonths, getYear, format, subWeeks } from 'date-fns';

const predefinedRanges: RangeType[] = [
    {
        label: 'Last week',
        value: [startOfWeek(subWeeks(new Date(), 1)), new Date()],
        placement: 'left'
    },
    {
        label: 'Last 7 days',
        value: [subDays(new Date(), 6), new Date()],
        placement: 'left'
    },
    {
        label: 'Last 30 days',
        value: [subDays(new Date(), 29), new Date()],
        placement: 'left'
    },
    {
        label: 'This month',
        value: [startOfMonth(new Date()), new Date()],
        placement: 'left'
    },
    {
        label: 'Last month',
        value: [startOfMonth(addMonths(new Date(), -1)), new Date()],
        placement: 'left'
    },
    {
        label: 'Max (6 Month)',
        value: [subMonths(new Date(), 6), new Date()],
        placement: 'left'
    },
    {
        label: 'This year',
        value: [startOfYear(new Date()), new Date()],
        placement: 'left'
    },
];
interface RangeDatePickerProps {
    onDateChange?: (from: Date, to: Date) => void;
    datePickerValue: DictDateRange;
}

const RangeDatePicker: React.FC<RangeDatePickerProps> = ({ onDateChange, datePickerValue }) => {

    const now = new Date();
    const sixMonthsAgoDate = subMonths(now, 6);
    const threeMonthsAgoDate = subMonths(now, 3);
    const sixMonthsAgo = format(sixMonthsAgoDate, 'yyyy-MM-dd');
    const currentDate = format(now, 'yyyy-MM-dd');

    const handleDateChange = (from: Date, to: Date) => {
        console.log("Date range changed", onDateChange, from, to);
        if (onDateChange) {
            onDateChange(from, to);
        }
    };

    const handleOk = (date: DateRange, event: React.SyntheticEvent) => {
        handleDateChange(date[0], date[1]);
    };

    const handleShortcutClick = (range: RangeType<DateRange>, event: React.MouseEvent) => {
        if (Array.isArray(range.value)) {
            handleDateChange(range.value[0], range.value[1]);
        }
    };

    return (
        <DateRangePicker
            ranges={predefinedRanges}
            placement={"bottomEnd"}
            style={{ width: 200 }}
            size="xs"
            shouldDisableDate={allowedRange(sixMonthsAgo, currentDate)}
            limitStartYear={getYear(sixMonthsAgoDate)}
            limitEndYear={getYear(now)}
            appearance="subtle"
            onOk={handleOk}
            value={[
                datePickerValue.from ? new Date(datePickerValue.from) : threeMonthsAgoDate,
                datePickerValue.to ? new Date(datePickerValue.to) : now
            ]}
            onShortcutClick={handleShortcutClick}

        />
    );
};

export default RangeDatePicker;
