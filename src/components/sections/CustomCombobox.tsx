// src/components/sections/CustomCombobox.tsx

import React, { useState } from "react";
import { Button } from "@jsinfo/components/ui/Button";
import { ChevronsUpDown } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@jsinfo/components/ui/Popover";
import { Checkbox } from "@jsinfo/components/ui/Checkbox";
import { Input } from "@jsinfo/components/ui/Input";

const CustomCombobox = ({ availableChains = [], selectedChains = [], onSelectionChange }: { availableChains: string[], selectedChains: string[], onSelectionChange: (updatedSelection: string[]) => void }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredChains = availableChains.filter(chain =>
        chain.toLowerCase().includes(search.toLowerCase())
    );

    const handleChainToggle = (chain: string) => {
        const updatedSelection = selectedChains.includes(chain)
            ? selectedChains.filter(c => c !== chain)
            : [...selectedChains, chain];
        onSelectionChange(updatedSelection);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedChains.length > 0
                        ? `${selectedChains.length} chain${selectedChains.length > 1 ? 's' : ''} selected`
                        : "Select chains..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <div className="p-2">
                    <Input
                        placeholder="Search chains..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                        {filteredChains.map((chain) => (
                            <div key={chain} className="flex items-center space-x-2 p-1">
                                <Checkbox
                                    id={chain}
                                    checked={selectedChains.includes(chain)}
                                    onCheckedChange={() => handleChainToggle(chain)}
                                />
                                <label
                                    htmlFor={chain}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {chain}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CustomCombobox;