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
        console.log("handleDateChange: started");
        console.log("handleDateChange: from", from);
        console.log("handleDateChange: to", to);
        if (onDateChange) {
            console.log("handleDateChange: calling onDateChange");
            onDateChange(from, to);
        }
        console.log("handleDateChange: ended");
    };

    const handleOk = (date: DateRange, event: React.SyntheticEvent) => {
        console.log("handleOk: started");
        console.log("handleOk: date", date);
        console.log("handleOk: event", event);
        console.log("handleOk: calling handleDateChange");
        handleDateChange(date[0], date[1]);
        console.log("handleOk: ended");
    };

    const handleShortcutClick = (range: RangeType<DateRange>, event: React.MouseEvent) => {
        console.log("handleShortcutClick: started");
        console.log("handleShortcutClick: range", range);
        console.log("handleShortcutClick: event", event);
        if (Array.isArray(range.value)) {
            console.log("handleShortcutClick: range.value is an array, calling handleDateChange");
            handleDateChange(range.value[0], range.value[1]);
        }
        console.log("handleShortcutClick: ended");
    };

    function handleOnOverlayEntered() {
        console.log("handleOnOverlayEntered: started");
        const buttons = document.querySelectorAll('div.rs-stack-item button[placement="left"][type="button"][aria-disabled="false"].rs-btn.rs-btn-link.rs-btn-sm');
        console.log("handleOnOverlayEntered: buttons", buttons);
        const handleClick = (event: Event) => {
            console.log("handleOnOverlayEntered: handleClick started");
            const buttonText = (event.target as HTMLElement).innerText;
            console.log("handleOnOverlayEntered: buttonText", buttonText);
            const range = predefinedRanges.find(range => range.label === buttonText);
            console.log("handleOnOverlayEntered: range", range);
            if (range) {
                console.log("handleOnOverlayEntered: range found, calling handleDateChange");
                handleDateChange(range.value[0], range.value[1]);
                const div = document.querySelector('div[data-testid="picker-popup"][role="dialog"][tabindex="-1"].rs-anim-fade.rs-anim-in.rs-picker-popup-daterange.rs-picker-popup.placement-bottom-end');
                console.log("handleOnOverlayEntered: div", div);
                if (div) {
                    console.log("handleOnOverlayEntered: div found, adding hide-animation class");
                    div.classList.add('hide-animation');
                }
            }
            console.log("handleOnOverlayEntered: handleClick ended");
            return;
        };
        buttons.forEach(button => button.addEventListener('click', handleClick));
        console.log("handleOnOverlayEntered: ended");
    }

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
            onEntered={handleOnOverlayEntered}
        />
    );
};

export default RangeDatePicker;
