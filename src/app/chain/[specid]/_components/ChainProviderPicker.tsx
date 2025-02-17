import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@jsinfo/lib/css";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@jsinfo/components/shadcn/ui/Command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@jsinfo/components/shadcn/ui/Popover";
import { Button } from "@jsinfo/components/shadcn/ui/Button";

interface ProviderData {
    top: Record<string, string>;
    all: Record<string, string>;
}

interface Provider {
    id: string;
    moniker: string;
    group: 'top' | 'all';
}

interface ProviderPickerProps {
    providers: ProviderData | undefined;
    selectedProviders: string[];
    onProvidersChange: (providers: string[]) => void;
}

export function ProviderPicker({
    providers,
    selectedProviders,
    onProvidersChange
}: ProviderPickerProps): JSX.Element {
    const [open, setOpen] = React.useState(false);

    // Simple check if all providers are selected
    const allProviders = React.useMemo(() => {
        if (!providers?.top || !providers?.all) return [];
        return [...Object.keys(providers.top), ...Object.keys(providers.all)];
    }, [providers?.top, providers?.all]);

    // Simple check if all top providers are selected
    const topProviders = React.useMemo(() => {
        if (!providers?.top) return [];
        return Object.keys(providers.top);
    }, [providers?.top]);

    const isAllSelected = selectedProviders.length === allProviders.length;
    const isTopSelected = topProviders.every(id => selectedProviders.includes(id));

    const handleSelect = React.useCallback((providerId: string) => {
        if (!providers?.top || !providers?.all) return;

        switch (providerId) {
            case 'all-providers':
                // If all are selected, clear selection. Otherwise, select all.
                onProvidersChange(isAllSelected ? [] : allProviders);
                break;

            case 'top-providers':
                if (isTopSelected) {
                    // Remove top providers from selection
                    onProvidersChange(selectedProviders.filter(id => !topProviders.includes(id)));
                } else {
                    // Add top providers to selection
                    onProvidersChange([
                        ...selectedProviders,
                        ...topProviders.filter(id => !selectedProviders.includes(id))
                    ]);
                }
                break;

            default:
                // Toggle individual provider
                onProvidersChange(
                    selectedProviders.includes(providerId)
                        ? selectedProviders.filter(id => id !== providerId)
                        : [...selectedProviders, providerId]
                );
        }
    }, [providers, selectedProviders, onProvidersChange, allProviders, topProviders, isAllSelected, isTopSelected]);

    // Loading state check after hooks
    if (!providers?.top || !providers?.all) {
        return (
            <Button
                variant="outline"
                className="w-full justify-between"
                disabled
            >
                <span className="truncate">Loading providers...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        );
    }

    // Calculate derived values after loading check
    const topProvidersList = Object.entries(providers.top).map(([id, moniker]) => ({
        id,
        moniker,
        group: 'top' as const
    }));

    const otherProvidersList = Object.entries(providers.all)
        .filter(([id]) => !providers.top[id])
        .map(([id, moniker]) => ({
            id,
            moniker,
            group: 'all' as const
        }));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selectedProviders.length === 0
                            ? "Select providers..."
                            : `${selectedProviders.length} provider${selectedProviders.length === 1 ? '' : 's'} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            {open && (
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search providers..." />
                        <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No providers found.</CommandEmpty>

                            {/* Special "All Providers" checkbox */}
                            <CommandGroup heading="Select All">
                                <CommandItem
                                    value="all-providers"
                                    onSelect={() => handleSelect('all-providers')}
                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                                >
                                    <div className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isAllSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                    )}>
                                        {isAllSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <span className="font-medium">All Providers</span>
                                </CommandItem>
                                <CommandItem
                                    value="top-providers"
                                    onSelect={() => handleSelect('top-providers')}
                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                                >
                                    <div className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isTopSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                    )}>
                                        {isTopSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <span className="font-medium">Top Providers</span>
                                </CommandItem>
                            </CommandGroup>

                            {/* Top Providers Section */}
                            {topProvidersList.length > 0 && (
                                <CommandGroup heading="Top Providers">
                                    {topProvidersList.map(provider => (
                                        <CommandItem
                                            key={provider.id}
                                            value={provider.id}
                                            onSelect={() => handleSelect(provider.id)}
                                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                                        >
                                            <div className={cn(
                                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedProviders.includes(provider.id)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50"
                                            )}>
                                                {selectedProviders.includes(provider.id) && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{provider.moniker}</span>
                                                <span className="text-xs text-muted-foreground">{provider.id}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {/* Other Providers Section */}
                            {otherProvidersList.length > 0 && (
                                <CommandGroup heading="Other Providers">
                                    {otherProvidersList.map(provider => (
                                        <CommandItem
                                            key={provider.id}
                                            value={provider.id}
                                            onSelect={() => handleSelect(provider.id)}
                                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                                        >
                                            <div className={cn(
                                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedProviders.includes(provider.id)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50"
                                            )}>
                                                {selectedProviders.includes(provider.id) && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{provider.moniker}</span>
                                                <span className="text-xs text-muted-foreground">{provider.id}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            )}
        </Popover>
    );
} 