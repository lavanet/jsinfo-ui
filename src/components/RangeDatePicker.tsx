// src/components/RangeDatePicker.tsx
import { DateRangePicker, Stack } from 'rsuite';

import { subDays, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, addMonths } from 'date-fns';

const predefinedRanges = [
    {
        label: 'Today',
        value: [new Date(), new Date()],
        placement: 'left'
    },
    {
        label: 'Yesterday',
        value: [addDays(new Date(), -1), addDays(new Date(), -1)],
        placement: 'left'
    },
    {
        label: 'This week',
        value: [startOfWeek(new Date()), endOfWeek(new Date())],
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
        value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
        placement: 'left'
    },
    {
        label: 'This year',
        value: [
            new Date(Math.max(new Date(new Date().getFullYear(), 0, 1).getTime(), new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()).getTime())),
            new Date()
        ],
        placement: 'left'
    },
    {
        label: 'Max (6 Month)',
        value: [new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()), new Date()],
        placement: 'left'
    },
    {
        label: 'Last week',
        value: (value: Date[] = []) => {
            const [start = new Date()] = value;
            return [
                addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
                addDays(endOfWeek(start, { weekStartsOn: 0 }), -7)
            ];
        },
        placement: 'left'
    }
];

const RangeDatePicker: React.FC = () => {
    return null
    // return (
    //     <DateRangePicker
    //         ranges={predefinedRanges}
    //         placeholder="Placement left"
    //         style={{ width: 300 }}
    //         onShortcutClick={(shortcut: Record<string, unknown>, event) => {
    //             console.log(shortcut);
    //         }}
    //     />
    // );
};

export default RangeDatePicker;