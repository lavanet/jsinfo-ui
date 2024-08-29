// src/components/sections/ProvidersTable.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/ui/Table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@jsinfo/components/ui/Pagination";

const ProvidersTable = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProviders();
  }, [currentPage]);

  const fetchProviders = async () => {
    try {
      const response = await fetch(`https://jsinfo.lavanet.xyz/indexProviders?pagination=totalStake,d,${currentPage},20`);
      const data = await response.json();
      setProviders(data.data);

      const countResponse = await fetch('https://jsinfo.lavanet.xyz/item-count/indexProviders');
      const countData = await countResponse.json();
      setTotalPages(Math.ceil(countData.itemCount / 20));
    } catch (error) {
      console.error('Error fetching providers:', error);
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Moniker</TableHead>
            <TableHead>Total Services</TableHead>
            <TableHead>Total Stake</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider: any, index) => (
            <TableRow key={index}>
              <Link href={`/provider/${provider.provider}`}>
                <TableCell>{provider.moniker}</TableCell>
              </Link>
              <TableCell>{provider.totalServices}</TableCell>
              <TableCell>{Number(provider.totalStake).toLocaleString()}</TableCell>
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

export default ProvidersTable;