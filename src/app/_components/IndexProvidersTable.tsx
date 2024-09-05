// src/app/_components/IndexProvidersTable.tsx

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jsinfo/components/ui2/Table";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import useApiSwrFetch from "@jsinfo/hooks/useApiSwrFetch";
import { AxiosApiGet } from "@jsinfo/fetching/axios";
import PaginationControl from "@jsinfo/components/modern/Pagination";

const ProvidersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProvidersCount = async () => {
    try {
      const countData = (await AxiosApiGet("item-count/indexProvidersActive")).data;
      setTotalPages(Math.ceil(countData.itemCount / 20));
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  useEffect(() => {
    fetchProvidersCount();
  }, [currentPage]);

  const { data, error, isLoading } = useApiSwrFetch(
    `indexProvidersActive?pagination=totalStake,d,${currentPage},20`
  );

  if (error) {
    return <div>Error loading data</div>;
  }

  if (!data)
    return (
      <LoadingIndicator
        loadingText={`Loading providers data`}
        greyText={`providers`}
      />
    );

  const providers = data?.data ?? [];

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
          {providers.map((provider: any, index: number) => (
            <TableRow key={index}>
              <Link className="orangelinks" href={`/provider/${provider.provider}`}>
                <TableCell>{provider.moniker}</TableCell>
              </Link>
              <TableCell>{provider.totalServices}</TableCell>
              <TableCell>{Number(provider.totalStake).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ProvidersTable;
