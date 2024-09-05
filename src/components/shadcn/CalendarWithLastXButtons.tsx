// src/components/shadcn/CalendarWithLastXButtons.tsx

"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"

import { cn } from "@jsinfo/lib/css"
import { buttonVariants } from "@jsinfo/components/shadcn/ui/Button"

import { subDays, startOfWeek, startOfMonth, startOfYear, subMonths, subWeeks } from 'date-fns';

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
    value: [startOfMonth(subMonths(new Date(), 1)), new Date()]
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
  // {
  //   label: '5 Month ago',
  //   value: [subMonths(new Date(), 5), new Date()]
  // },
  {
    label: '6 Month ago (max)',
    value: [subMonths(new Date(), 6), new Date()]
  },
  {
    label: 'This year',
    value: [startOfYear(new Date()), new Date()],
  },
].map(item => ({ ...item, placement: 'left', disabled: false }));

interface CalendarWithLastXButtonsProps {
  onSelect: (range: DateRange | undefined) => void;
  selected: DateRange | undefined;
}

const CalendarWithLastXButtons: React.FC<CalendarWithLastXButtonsProps> = ({ onSelect, selected }) => {

  if (!selected) selected = { from: subMonths(new Date(), 1), to: new Date() }

  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(selected);

  const handleRangeClick = (range: any) => {
    setSelectedRange({ from: range.value[0], to: range.value[1] })
    onSelect(selectedRange)
  }

  const onDateRangeSelectHandler = (range: DateRange | undefined) => {
    console.log('CalendatWith x ubsttong onDateRangeSelectHandler', range)
    setSelectedRange(range)
    onSelect(range)
  }

  const disabledDays = { before: subMonths(new Date(), 6), after: new Date() };

  return (
    <div className="flex">
      {/* Sidebar with predefined ranges */}
      <div className="flex flex-col space-y-1 mr-0 ml-2 mt-2">
        {predefinedRanges.map((range, index) => (
          <button
            key={index}
            className={cn(buttonVariants({ variant: "outline" }), "w-40 text-left p-1")}
            style={{ zoom: 0.7, justifyContent: 'left', paddingLeft: '10px' }}
            onClick={() => handleRangeClick(range)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <DayPicker
        mode={"range"}
        defaultMonth={subMonths(new Date(), 1)}
        numberOfMonths={2}
        disabled={disabledDays}
        toDate={new Date()}
        showOutsideDays={true}
        className={cn("p-3")}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        selected={selectedRange}
        onSelect={onDateRangeSelectHandler}
        components={{
          // IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          // IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}

      />
    </div>
  )
}
CalendarWithLastXButtons.displayName = "CalendarWithLastXButtons"

export { CalendarWithLastXButtons }
