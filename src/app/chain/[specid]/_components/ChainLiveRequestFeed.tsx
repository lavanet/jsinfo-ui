// src/app/chain/[specid]/_components/ChainLiveRequestFeed.tsx

"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@jsinfo/components/shadcn/ui/Card";
import { Checkbox } from "@jsinfo/components/shadcn/ui/Checkbox";
import { Button } from "@jsinfo/components/shadcn/ui/Button";
import { Play, Pause, Activity } from "lucide-react";
import ChainLiveFeedRequestsTable from './ChainLiveFeedRequestsTable';

interface LiveRequestFeedProps {
    specid: string;
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

const MAX_ENTRIES = 10;

const ChainLiveRequestFeed: React.FC<LiveRequestFeedProps> = ({ specid }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEverPlayed, setHasEverPlayed] = useState(false);
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [emptyFetchCount, setEmptyFetchCount] = useState(0);

    const shouldResetEntriesRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (shouldResetEntriesRef.current) {
            setEntries([]);
            shouldResetEntriesRef.current = false;
        }

        let url = `https://cf-logpush.lavapro.xyz/entries?chain_id=${specid.toLocaleLowerCase()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Raw data received:", data);

            if (!data.entries || !Array.isArray(data.entries)) {
                console.error("Unexpected data structure:", data);
                return;
            }

            let newEntries = data.entries;
            if (showOnlyErrors) {
                newEntries = newEntries.filter((entry: Entry) =>
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

        } catch (error) {
            console.error("Error fetching data:", error);
            setEmptyFetchCount(prev => prev + 1);
        }
    }, [specid, showOnlyErrors]);

    const handleErrorFilterChange = (checked: boolean) => {
        setShowOnlyErrors(checked);
        shouldResetEntriesRef.current = true;
        setIsPlaying(true);
        setEmptyFetchCount(0);
    };

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
                    <ChainLiveFeedRequestsTable data={entries} />
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

export default ChainLiveRequestFeed;