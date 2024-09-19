// src/app/provider/[lavaid]/_components/ProviderLiveRequestFeed.tsx

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useLogpushStreamFetch } from '@jsinfo/fetching/logpush/hooks/useLogpushStreamFetch';
import { Card, CardContent, CardHeader, CardTitle } from "@jsinfo/components/shadcn/ui/Card";
import { Checkbox } from "@jsinfo/components/shadcn/ui/Checkbox";
import { Button } from "@jsinfo/components/shadcn/ui/Button";
import { Play, Pause } from "lucide-react";
import { Activity } from "lucide-react";
import ProviderSpecsDropDown from './ProviderSpecsDropDown';
import ProviderLiveFeedRequestsTable from './ProviderLiveFeedRequestsTable';

interface LiveRequestFeedProps {
    lavaid: string;
}

interface Entry {
    chain_id: string;
    city: string;
    country: string;
    interface_type: string;
    is_archive: boolean;
    is_node_error: boolean;
    latency: number;
    lava_provider_address: string;
    method: string;
    node_error: string;
    origin_consumer: string;
    request_type: string;
    response_size: number;
    status: number;
    timestamp: string;
}

interface LogpushResponse {
    entries: Entry[];
}

const MAX_ENTRIES = 10;

const ProviderLiveRequestFeed: React.FC<LiveRequestFeedProps> = ({ lavaid }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEverPlayed, setHasEverPlayed] = useState(false);
    const [selectedChain, setSelectedChain] = useState<string | null>(null);
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [emptyFetchCount, setEmptyFetchCount] = useState(0);
    const shouldResetEntriesRef = useRef(false);

    const queryParams: Record<string, string> = {
        provider: lavaid,
        ...(selectedChain && selectedChain !== 'all' ? { chain_id: selectedChain.toLowerCase() } : {})
    };

    const { data, error, isLoading, fetchData } = useLogpushStreamFetch<LogpushResponse>({
        baseUrl: 'https://cf-logpush.lavapro.xyz/entries',
        queryParams
    });

    useEffect(() => {
        if (data) {
            if (shouldResetEntriesRef.current) {
                setEntries([]);
                shouldResetEntriesRef.current = false;
            }

            let newEntries = data.entries;
            if (showOnlyErrors) {
                newEntries = newEntries.filter(entry =>
                    entry.is_node_error ||
                    entry.node_error !== "" ||
                    entry.status !== 200
                );
            }

            if (newEntries.length === 0) {
                setEmptyFetchCount(prev => prev + 1);
            } else {
                setEmptyFetchCount(0);
            }

            setEntries(prevEntries => {
                const combinedEntries = [...newEntries, ...prevEntries];
                return combinedEntries.slice(0, MAX_ENTRIES);
            });
        }
    }, [data, showOnlyErrors]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (isPlaying) {
            fetchData(); // Fetch immediately
            intervalId = setInterval(fetchData, 500);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPlaying, fetchData]);

    const handleSpecChange = (spec: string) => {
        setSelectedChain(spec === 'all' ? '' : spec);
        shouldResetEntriesRef.current = true;
        setIsPlaying(true);
        setEmptyFetchCount(0);
    };

    const handleErrorFilterChange = (checked: boolean) => {
        setShowOnlyErrors(checked);
        shouldResetEntriesRef.current = true;
        setIsPlaying(true);
        setEmptyFetchCount(0);
    };

    const togglePlaying = () => {
        setIsPlaying(prev => !prev);
        if (!hasEverPlayed) {
            setHasEverPlayed(true);
        }
        setEmptyFetchCount(0);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Live Request Feed</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ProviderSpecsDropDown
                            lavaid={lavaid}
                            onSpecChange={handleSpecChange}
                        />
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="showOnlyErrors"
                                checked={showOnlyErrors}
                                onCheckedChange={handleErrorFilterChange}
                            />
                            <label
                                htmlFor="showOnlyErrors"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Only errors
                            </label>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlaying}
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4 text-gray-500" />
                            ) : (
                                <Play className="h-4 w-4 text-green-500" />
                            )}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {entries.length > 0 ? (
                    <ProviderLiveFeedRequestsTable data={entries} />
                ) : (
                    <p>
                        {!hasEverPlayed
                            ? 'Press play to start fetching.'
                            : isPlaying
                                ? emptyFetchCount < 3
                                    ? 'Fetching data...'
                                    : 'Still fetching data... but it seems like there are no entries for the selected filters.'
                                : 'No entries available. Press play to resume fetching.'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default ProviderLiveRequestFeed;