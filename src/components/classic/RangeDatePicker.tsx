// src/components/RangeDatePicker.tsx

import DateRangePicker, { DateRange, RangeType } from 'rsuite/DateRangePicker';
const { allowedRange } = DateRangePicker;
import { subDays, startOfWeek, startOfMonth, startOfYear, addMonths, subMonths, getYear, format, subWeeks } from 'date-fns';
import { CachedFetchDateRange } from '@jsinfo/lib/types';
import { useEffect, useState } from 'react';

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
].map(item => ({ ...item, placement: 'left', disabled: false }));

interface RangeDatePickerProps {
    onDateChange?: (dates: { from: Date, to: Date }) => void;
    datePickerValue: CachedFetchDateRange;
}

const RangeDatePickerDebugEnabled = false;

function RangeDatePickerDebugLog(...args: any[]) {
    if (RangeDatePickerDebugEnabled) {
        console.log(...args);
    }
}

const RangeDatePicker: React.FC<RangeDatePickerProps> = ({ onDateChange, datePickerValue }) => {

    const now = new Date();
    const sixMonthsAgoDate = subMonths(now, 6);
    const threeMonthsAgoDate = subMonths(now, 3);
    const sixMonthsAgo = format(sixMonthsAgoDate, 'yyyy-MM-dd');
    const currentDate = format(now, 'yyyy-MM-dd');
    const handleDateChange = (from: Date, to: Date) => {
        RangeDatePickerDebugLog("handleDateChange: started");
        RangeDatePickerDebugLog("handleDateChange: from", from);
        RangeDatePickerDebugLog("handleDateChange: to", to);
        if (onDateChange) {
            RangeDatePickerDebugLog("handleDateChange: calling onDateChange");
            onDateChange({ from, to });
        }
        RangeDatePickerDebugLog("handleDateChange: ended");
    };

    // all document calls need to be in useEffect because of SSR
    const handleOkInner = (date: DateRange) => {
        RangeDatePickerDebugLog("handleOk: started");
        RangeDatePickerDebugLog("handleOk: date", date);
        RangeDatePickerDebugLog("handleOk: event", event);
        RangeDatePickerDebugLog("handleOk: calling handleDateChange");
        handleDateChange(date[0], date[1]);
        RangeDatePickerDebugLog("handleOk: ended");
    };

    const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);

    const handleOk = (date: DateRange, event: React.SyntheticEvent) => {
        setSelectedRange(date);
    };

    useEffect(() => {
        if (selectedRange) handleOkInner(selectedRange);
    }, [selectedRange, handleOkInner]);


    const handleShortcutClick = (range: RangeType<DateRange>, event: React.MouseEvent) => {
        // this is the normal flow - this works on all machines
        RangeDatePickerDebugLog("handleShortcutClick: started");
        RangeDatePickerDebugLog("handleShortcutClick: range", range);
        RangeDatePickerDebugLog("handleShortcutClick: event", event);
        if (Array.isArray(range.value)) {
            RangeDatePickerDebugLog("handleShortcutClick: range.value is an array, calling handleDateChange");
            handleDateChange(range.value[0], range.value[1]);
        }
        RangeDatePickerDebugLog("handleShortcutClick: ended");
    };

    function handleOnOverlayEntered() {
        if (typeof document === 'undefined') return;
        // this is the additional flow for the windows bug/chrome - very rare - don't touch this
        RangeDatePickerDebugLog("handleOnOverlayEntered: started");
        const buttons = document.querySelectorAll('div.rs-stack-item button[placement="left"][type="button"][aria-disabled="false"].rs-btn.rs-btn-link.rs-btn-sm');
        RangeDatePickerDebugLog("handleOnOverlayEntered: buttons", buttons);
        const handleClick = (event: Event) => {
            RangeDatePickerDebugLog("handleOnOverlayEntered: handleClick started");
            const buttonText = (event.target as HTMLElement).innerText;
            RangeDatePickerDebugLog("handleOnOverlayEntered: buttonText", buttonText);
            const range = predefinedRanges.find(range => range.label === buttonText);
            RangeDatePickerDebugLog("handleOnOverlayEntered: range", range);
            if (range) {
                RangeDatePickerDebugLog("handleOnOverlayEntered: range found, calling handleDateChange");
                handleDateChange(range.value[0], range.value[1]);
                const div = document.querySelector('div[data-testid="picker-popup"][role="dialog"][tabindex="-1"].rs-anim-fade.rs-anim-in.rs-picker-popup-daterange.rs-picker-popup.placement-bottom-end');
                RangeDatePickerDebugLog("handleOnOverlayEntered: div", div);
                if (div) {
                    RangeDatePickerDebugLog("handleOnOverlayEntered: div found, adding hide-animation class");
                    div.classList.add('hide-animation');
                }
            }
            RangeDatePickerDebugLog("handleOnOverlayEntered: handleClick ended");
            return;
        };
        buttons.forEach(button => button.addEventListener('click', handleClick));
        RangeDatePickerDebugLog("handleOnOverlayEntered: ended");
    }

    // this is the additional flow for the windows bug/chrome - very rare - don't touch this
    useEffect(() => {
        const button = document.querySelector('span.rs-input-group-addon > button.rs-picker-clean.rs-btn-close');
        RangeDatePickerDebugLog("handleOnOverlayEnteredCloseDiv: button", button);
        if (button) {
            button.addEventListener('click', () => {
                const div = document.querySelector('div[data-testid="picker-popup"][role="dialog"][tabindex="-1"].rs-anim-fade.rs-anim-in.rs-picker-popup-daterange.rs-picker-popup.placement-bottom-end');
                RangeDatePickerDebugLog("handleOnOverlayEnteredCloseDiv click: div", div);
                if (div) {
                    RangeDatePickerDebugLog("handleOnOverlayEnteredCloseDiv click: div found, adding hide-animation class");
                    div.classList.add('hide-animation');
                }
            });
        }
    }, []);

    return (
        <DateRangePicker
            disabled={false} // this is the additional flow for the windows bug/chrome - very rare - don't touch this
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
