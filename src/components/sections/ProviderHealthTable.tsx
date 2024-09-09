// src/components/sections/ProviderHealthTable.tsx

'use client';

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/shadcn/ui2/Table";
import { Badge } from "@jsinfo/components/shadcn/ui/Badge";
import { useApiSwrFetch } from '@jsinfo/hooks/useApiSwrFetch';
import LoadingIndicator from '../modern/LoadingIndicator';
import Link from 'next/link';
import { MoveUp, MoveDown } from 'lucide-react'

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

type SortColumn = 'spec' | 'interface' | 'status' | 'message' | 'region' | 'timestamp';
type SortDirection = 'asc' | 'desc';

export function ProviderLatestHealthTable(props: ProviderLatestHealthTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('spec');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Use the provided hook for fetching data
  const { data, error, isLoading } = useApiSwrFetch(`providerLatestHealth/${props.providerId}`);

  const healthData: HealthData = data?.data ?? null;

  const sortedData = useMemo(() => {
    if (!healthData) return [];

    const flatData = healthData.specs.flatMap((spec) =>
      Object.keys(spec.specData.interfaces).flatMap((iface) =>
        Object.keys(spec.specData.interfaces[iface]).map((region) => ({
          spec: spec.spec,
          interface: iface,
          region,
          ...spec.specData.interfaces[iface][region],
          message: spec.specData.interfaces[iface][region].data,
        }))
      )
    );

    return flatData.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [healthData, sortColumn, sortDirection]);


  if (isLoading) {
    return <LoadingIndicator loadingText={`Loading health data`} greyText={`provider health`} />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

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

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };



  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (column !== sortColumn) return null;
    return sortDirection === 'asc' ? <MoveUp className="w-4 h-4 inline-block ml-1" /> : <MoveDown className="w-4 h-4 inline-block ml-1" />;
  };

  return (
    <>
      {healthData ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('spec')} className="cursor-pointer">
                Spec <SortIcon column="spec" />
              </TableHead>
              <TableHead onClick={() => handleSort('interface')} className="cursor-pointer">
                Interface <SortIcon column="interface" />
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status <SortIcon column="status" />
              </TableHead>
              <TableHead onClick={() => handleSort('message')} className="cursor-pointer">
                Message <SortIcon column="message" />
              </TableHead>
              <TableHead onClick={() => handleSort('region')} className="cursor-pointer">
                Region <SortIcon column="region" />
              </TableHead>
              <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
                Timestamp <SortIcon column="timestamp" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(({ spec, interface: iface, status, data: message, region, timestamp }) => (
              <TableRow key={`${spec}-${iface}-${region}`}>
                <TableCell><Link className='orangelinks' href={`/chain/${spec}}`}>{spec}</Link></TableCell>
                <TableCell>{iface}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </TableCell>
                <TableCell>{message || 'N/A'}</TableCell>
                <TableCell>{region}</TableCell>
                <TableCell>{new Date(timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default ProviderLatestHealthTable;
