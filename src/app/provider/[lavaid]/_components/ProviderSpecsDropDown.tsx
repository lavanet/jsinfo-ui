// src/app/provider/[lavaid]/_components/ProviderSpecsDropDown.tsx

import React from 'react';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jsinfo/components/shadcn/ui/Select";
import { Loader2 } from "lucide-react";
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';

interface ProviderSpecsDropDownData {
    allAvailableSpecs: string[];
}

interface ProviderSpecsDropDownProps {
    lavaid: string;
    onSpecChange: (spec: string) => void;
}

const ProviderSpecsDropDown: React.FC<ProviderSpecsDropDownProps> = ({ lavaid, onSpecChange }) => {
    const { data, isLoading, error } = useJsinfobeFetch(`providerChartsV2/all/${lavaid}`);

    if (error) return <ErrorDisplay message={error} />;

    const specData = data as ProviderSpecsDropDownData | undefined;

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading specs...</span>
            </div>
        );
    }

    return (
        <Select onValueChange={(value) => onSpecChange(value)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {specData?.allAvailableSpecs
                    .filter((spec: string) => spec !== 'all')
                    .map((spec: string) => (
                        <SelectItem key={spec} value={spec}>
                            {spec}
                        </SelectItem>
                    ))}
            </SelectContent>
        </Select>
    );
};

export default ProviderSpecsDropDown;