// src/app/provider/[lavaid]/_components/ChainLiveFeedRequestsTable.tsx

"use client"

import React, { useState } from 'react';
import { Badge } from "@jsinfo/components/shadcn/ui/Badge";
import { Globe, Clock, Server, Archive, AlertTriangle } from "lucide-react";
import { chainDictionary } from '@jsinfo/lib/chain-dictionary';

interface Entry {
    chain_id: string;
    city: string;
    country: string;
    interface_type: string;
    is_archive: boolean;
    latency: number;
    lava_provider_address: string;
    method: string;
    request_type: string;
    response_size: number;
    status: number;
    timestamp: string;
    node_error?: string;
    is_node_error?: boolean;
}

const formatRequest = (request: string) => {
    if (!request) return 'N/A';
    const batchCount = (request.match(/&/g) || []).length;
    if (batchCount > 0) {
        return `Batch (${batchCount + 1})`;
    }
    return request;
};

const formatSize = (size: number) => {
    if (size < 1024) return `${size.toString().padStart(3, ' ')} B `;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-700 text-white";
    if (status >= 400) return "bg-red-700 text-white";
    return "bg-gray-700 text-white";
};

const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((Number(now) - Number(then)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const ChainLiveFeedRequestsTable: React.FC<{ data: Entry[] }> = ({ data }) => {
    return (
        <>
            <div className="space-y-4">
                {data.map((request, index) => (
                    <div key={index} className="bg-secondary rounded-lg p-4 shadow-sm border border-secondary-foreground/10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                                {chainDictionary[request.chain_id] && (
                                    <div className="relative w-5 h-5">

                                        <img
                                            src={chainDictionary[request.chain_id].icon}
                                            alt={chainDictionary[request.chain_id].name}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                                <Badge variant="outline" className="text-sm font-semibold border-2">
                                    {chainDictionary[request.chain_id]?.name || request.chain_id}
                                </Badge>
                                {request.is_archive && (
                                    <Badge variant="secondary" className="border-2 flex items-center space-x-1">
                                        <Archive className="w-3 h-3" />
                                        <span>Archive</span>
                                    </Badge>
                                )}
                                {request.is_node_error && (
                                    <Badge variant="destructive" className="border-2 flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Node Error</span>
                                    </Badge>
                                )}
                            </div>
                            <Badge className={`${getStatusColor(request.status)} px-2 py-1 rounded-md`}>
                                {request.status}
                            </Badge>
                        </div>
                        {request.node_error && (
                            <div className="mb-2 text-sm text-destructive">
                                Error: {request.node_error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {request.country ? (
                                        <FlagImage country={request.country} />
                                    ) : (
                                        <Globe className="w-4 h-4 mr-2" />
                                    )}
                                    {request.city ? `${request.city}, ` : ''}{request.country}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {getTimeAgo(request.timestamp)}
                                </div>
                                {request.lava_provider_address && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Server className="w-4 h-4 mr-2" />
                                        {request.lava_provider_address}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-end text-sm font-medium">
                                    {formatRequest(request.request_type)}
                                </div>
                                <div className="flex items-center justify-end">
                                    <Badge variant="outline" className="ml-1 w-24 justify-center border-2">
                                        {(request.latency?.toString() ?? '').padStart(4, ' ')} ms
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Badge variant="outline" className="ml-1 w-24 justify-center border-2">
                                        {formatSize(request.response_size)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

interface FlagImageProps {
    country: string;
}

const FlagImage: React.FC<FlagImageProps> = ({ country }) => {
    const [showGlobe, setShowGlobe] = useState(false);

    if (showGlobe) {
        return <Globe className="w-4 h-4 mr-2" />;
    }

    return (
        <div className="relative w-5 h-4 mr-2">
            <img
                src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`}
                alt={country}
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                onError={() => setShowGlobe(true)}
            />
        </div>
    );
};

export default ChainLiveFeedRequestsTable;