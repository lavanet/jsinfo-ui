"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@jsinfo/lib/css"
import { Button } from "@jsinfo/components/shadcn/ui/Button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@jsinfo/components/shadcn/ui/Command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@jsinfo/components/shadcn/ui/Popover"

interface Option {
    value: string;
    label: string;
}

interface ComboboxDemoProps {
    options: Option[];
    value: string;
    setValue: (value: string) => void;
    placeholder?: string;
    className?: string;
    displayValue?: (value: string) => string;
}

export const ComboboxDemo: React.FC<ComboboxDemoProps> = ({
    options,
    value,
    setValue,
    placeholder = "Select an option...",
    className,
    displayValue,
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between text-white", className)}
                    style={{ borderColor: "hsl(var(--input))" }}
                >
                    {value
                        ? displayValue?.(value) ?? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-[--radix-popover-trigger-width] p-0 bg-background", className)}
                align="start"
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder="Search options..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                    className="text-white hover:bg-accent"
                                >
                                    {option.label}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default ComboboxDemo;