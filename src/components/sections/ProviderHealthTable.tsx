// src/components/sections/ProviderHealthTable.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/ui2/Table";
import { Badge } from "@jsinfo/components/ui/Badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@jsinfo/components/ui2/Pagination";

interface HealthData {
  id: string;
  timestamp: string;
  spec: string;
  interface: string;
  status: string;
  message: string;
  provider: string;
  region: string;
}

interface ProviderHealthTableProps {
  providerId?: string | null;
}

export function ProviderHealthTable(props: ProviderHealthTableProps = { providerId: null }) {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHealthData();
  }, [currentPage, props.providerId]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`https://jsinfo.lavanet.xyz/providerHealth/${props.providerId}?pagination=timestamp,d,${currentPage},20`);
      const data = await response.json();
      setHealthData(data.data);

      const countResponse = await fetch(`https://jsinfo.lavanet.xyz/item-count/providerHealth/${props.providerId}`);
      const countData = await countResponse.json();
      setTotalPages(Math.ceil(countData.itemCount / 20));
    } catch (error) {
      console.error('Error fetching provider health data:', error);
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    const maxVisiblePages = 5;
    const ellipsisThreshold = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - ellipsisThreshold && i <= currentPage + ellipsisThreshold)
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - ellipsisThreshold - 1 && i > 1) ||
        (i === currentPage + ellipsisThreshold + 1 && i < totalPages)
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    return items;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'jailed':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
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
          {healthData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.spec}</TableCell>
              <TableCell>{item.interface}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              </TableCell>
              <TableCell>{item.message}</TableCell>
              <TableCell>{item.region}</TableCell>
              <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.max(prev - 1, 1));
              }}
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export default ProviderHealthTable;