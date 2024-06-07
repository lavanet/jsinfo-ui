// src/components/RangeDatePicker.tsx
import DateRangePicker, { DateRange, RangeType } from 'rsuite/DateRangePicker';
const { allowedRange } = DateRangePicker;
import { subDays, startOfWeek, startOfMonth, startOfYear, addMonths, subMonths, getYear, format, subWeeks } from 'date-fns';
import { CachedFetchDateRange } from '@jsinfo/common/types';

const predefinedRanges: any[] = [
    {
        label: 'Last week',
        value: [startOfWeek(subWeeks(new Date(), 1)), new Date()],
    },
    {
        label: 'Last 7 days',
        value: [subDays(new Date(), 6), new Date()]
    },
    {
        label: 'This month',
        value: [startOfMonth(new Date()), new Date()]
    },
    {
        label: 'Last month',
        value: [startOfMonth(addMonths(new Date(), -1)), new Date()]
    },
    {
        label: '1 Month ago',
        value: [subMonths(new Date(), 1), new Date()]
    },
    {
        label: '2 Month ago',
        value: [subMonths(new Date(), 2), new Date()]
    },
    {
        label: '3 Month ago',
        value: [subMonths(new Date(), 3), new Date()]
    },
    {
        label: '4 Month ago',
        value: [subMonths(new Date(), 4), new Date()]
    },
    {
        label: '5 Month ago',
        value: [subMonths(new Date(), 5), new Date()]
    },
    {
        label: '6 Month ago (max)',
        value: [subMonths(new Date(), 6), new Date()]
    },
    {
        label: 'This year',
        value: [startOfYear(new Date()), new Date()],
    },
    // strange windows bug - leave the disabled here
].map(item => ({ ...item, placement: 'left', disabled: false }));

interface RangeDatePickerProps {
    onDateChange?: (from: Date, to: Date) => void;
    datePickerValue: CachedFetchDateRange;
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
            disabled={false} // strange windows bug - leave this here
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
