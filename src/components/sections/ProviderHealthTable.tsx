// src/components/sections/ProviderHealthTable.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/shadcn/ui2/Table";
import { Badge } from "@jsinfo/components/shadcn/ui/Badge";
import useApiSwrFetch from '@jsinfo/hooks/useApiSwrFetch';
import LoadingIndicator from '../modern/LoadingIndicator';
import Link from 'next/link';

interface InterfaceData {
  status: string;
  data: string;
  timestamp: string;
}

interface SpecData {
  spec: string;
  specData: {
    overallStatus: string;
    interfaces: {
      [key: string]: {
        [key: string]: InterfaceData;
      };
    };
  };
}

interface HealthData {
  provider: string;
  specs: SpecData[];
}

interface ProviderLatestHealthTableProps {
  providerId: string;
}

export function ProviderLatestHealthTable(props: ProviderLatestHealthTableProps) {

  // Use the provided hook for fetching data
  const { data, error, isLoading } = useApiSwrFetch(`providerLatestHealth/${props.providerId}`);

  if (isLoading) {
    return <LoadingIndicator loadingText={`Loading health data`} greyText={`provider health`} />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const healthData: HealthData = data?.data ?? null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'frozen':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {healthData ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Spec</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthData.specs.map((spec) => {
                return Object.keys(spec.specData.interfaces).map((iface) =>
                  Object.keys(spec.specData.interfaces[iface]).map((region) => {
                    const interfaceData = spec.specData.interfaces[iface][region];
                    return (
                      <TableRow key={`${spec.spec}-${iface}-${region}`}>
                        <TableCell><Link className='orangelinks' href={`/chain/${spec.spec}}`}>{spec.spec}</Link></TableCell>
                        <TableCell>{iface}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(interfaceData.status)}>
                            {interfaceData.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{interfaceData.data || 'N/A'}</TableCell>
                        <TableCell>{region}</TableCell>
                        <TableCell>{new Date(interfaceData.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                );
              })}
            </TableBody>
          </Table>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default ProviderLatestHealthTable;
