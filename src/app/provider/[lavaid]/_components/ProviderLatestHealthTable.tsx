// src/components/sections/ProviderHealthTable.tsx

'use client';

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/shadcn/ui2/Table";
import { useJsinfobeSwrFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeSwrFetch';
import LoadingIndicator from '../../../../components/modern/LoadingIndicator';
import Link from 'next/link';
import { MoveUp, MoveDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@jsinfo/components/shadcn/ui/Card";
import { Checkbox } from "@jsinfo/components/shadcn/ui/Checkbox";
import StatusCall from '@jsinfo/components/modern/StatusCell';
import ChainWithIconLink from '@jsinfo/components/modern/ChainWithIconLink';

interface InterfaceData {
  status: string;
  data: string;
  timestamp: string;
  message: string;
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

interface HealthTableRow {
  spec: string;
  interface: string;
  status: string;
  region: string;
  timestamp: string;
  message?: string;
}

type SortColumn = 'spec' | 'interface' | 'status' | 'message' | 'region' | 'timestamp';
type SortDirection = 'asc' | 'desc';

export function ProviderLatestHealthTable({ providerId }: ProviderLatestHealthTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('spec');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSummary, setShowSummary] = useState(true);

  // Use the provided hook for fetching data
  const { data, error, isLoading } = useJsinfobeSwrFetch(`providerLatestHealth/${providerId}`);

  if (isLoading) {
    return <LoadingIndicator loadingText={`Loading health data`} greyText={`provider health`} />;
  }

  if (error || (data && 'error' in data)) {
    return (
      <Card style={{ padding: '23px' }}>
        <CardHeader className="p-0">
          <CardTitle>Provider Latest Health</CardTitle>
          <CardDescription>Recent health status for provider services</CardDescription>
        </CardHeader>
        <div className="mt-4 text-center text-muted-foreground">
          {error || (data && 'error' in data ? data.error : 'No health data available')}
        </div>
      </Card>
    );
  }

  const healthData: HealthData = data?.data ?? null;

  const sortedData = useMemo(() => {
    if (!healthData) return [];

    if (showSummary) {
      return healthData.specs.map((spec): HealthTableRow => ({
        spec: spec.spec,
        interface: Object.keys(spec.specData.interfaces).join(", "),
        status: spec.specData.overallStatus,
        region: "All",
        timestamp: Object.values(spec.specData.interfaces)
          .flatMap(Object.values)
          .reduce((latest, current) =>
            latest.timestamp > current.timestamp ? latest : current
          ).timestamp,
        message: undefined // Add this line
      }));
    }

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
  }, [healthData, sortColumn, sortDirection, showSummary]);

  if (error) {
    return <div>Error loading data</div>;
  }

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
    <Card style={{ padding: '23px' }}>
      <div className="flex items-center justify-between mb-4">
        <CardHeader className="p-0">
          <CardTitle>Provider Latest Health</CardTitle>
          <CardDescription>Recent health status for provider services</CardDescription>
        </CardHeader>
        <div className="flex items-center">
          <Checkbox
            id="summaryView"
            checked={showSummary}
            onCheckedChange={(checked) => setShowSummary(checked as boolean)}
          />
          <label htmlFor="summaryView" className="ml-2">Summary</label>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('spec')} className="cursor-pointer">
              Spec <SortIcon column="spec" />
            </TableHead>
            <TableHead onClick={() => handleSort('interface')} className="cursor-pointer">
              {showSummary ? 'Interfaces' : 'Interface'} <SortIcon column="interface" />
            </TableHead>
            <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
              Status <SortIcon column="status" />
            </TableHead>
            {!showSummary && (
              <>
                <TableHead onClick={() => handleSort('message')} className="cursor-pointer">
                  Message <SortIcon column="message" />
                </TableHead>
                <TableHead onClick={() => handleSort('region')} className="cursor-pointer">
                  Region <SortIcon column="region" />
                </TableHead>
              </>
            )}
            <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
              Timestamp <SortIcon column="timestamp" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <ChainWithIconLink chainId={row.spec} className="orangelinks" />
              </TableCell>
              <TableCell>{row.interface}</TableCell>
              <TableCell>
                <StatusCall status={row.status} />
              </TableCell>
              {!showSummary && (
                <>
                  <TableCell>{row.message || 'N/A'}</TableCell>
                  <TableCell>{row.region}</TableCell>
                </>
              )}
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default ProviderLatestHealthTable;
