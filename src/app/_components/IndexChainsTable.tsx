// src/app/_components/IndexChainsTable.tsx

"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jsinfo/components/shadcn/ui2/Table";
import Link from "next/link";
import { useApiSwrFetch } from "@jsinfo/hooks/useApiSwrFetch";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import PaginationControl from "@jsinfo/components/modern/Pagination";
import ChainWithIconLink from "@jsinfo/components/modern/ChainWithIconLink";

const ChainsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading } = useApiSwrFetch("indexTopChains");

  if (!data) return <LoadingIndicator loadingText={`Loading chains data`} greyText={`chains`} />;

  if (error) {
    return <div>Error loading data</div>;
  }

  const chains = data?.allSpecs ?? [];
  const totalPages = Math.ceil(chains.length / 20);

  const paginatedChains = chains.slice((currentPage - 1) * 20, currentPage * 20);

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
          {paginatedChains.map((chain: any, index: number) => (
            <TableRow key={index}>
              <TableCell>
                <ChainWithIconLink chainId={chain.chainId} className="orangelinks" />
              </TableCell>
              <TableCell>{Number(chain.relaySum).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Use the PaginationControl here */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ChainsTable;
