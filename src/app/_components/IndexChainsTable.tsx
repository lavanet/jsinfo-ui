// src/app/_components/IndexChainsTable.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/shadcn/Table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@jsinfo/components/shadcn/Pagination";
import Link from 'next/link';

const ChainsTable = () => {
  const [chains, setChains] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchChains();
  }, [currentPage]);

  const fetchChains = async () => {
    try {
      const response = await fetch('https://jsinfo.lavanet.xyz/index');
      const data = await response.json();
      setChains(data.allSpecs);
      setTotalPages(Math.ceil(data.allSpecs.length / 20));
    } catch (error) {
      console.error('Error fetching chains:', error);
    }
  };

  const paginatedChains = chains.slice((currentPage - 1) * 20, currentPage * 20);

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
            <TableHead>Chain ID</TableHead>
            <TableHead>Relay Sum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedChains.map((chain, index) => (
            <TableRow key={index}>
              <TableCell><Link className='orangelinks' href={`/spec/${chain.chainId}`}>{chain.chainId}</Link></TableCell>
              <TableCell>{Number(chain.relaySum).toLocaleString()}</TableCell>
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

export default ChainsTable;