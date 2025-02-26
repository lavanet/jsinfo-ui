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
} from "@jsinfo/components/shadcn/ui2/Table";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import { useJsinfobeFetch } from "@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch";
import { JsinfobeAxiosGet } from "@jsinfo/fetching/jsinfobe/api-client/JsinfobeAxiosGet";
import PaginationControl from "@jsinfo/components/modern/Pagination";
import ModernTooltip from "@jsinfo/components/modern/ModernTooltip";
import { IsMeaningfulText } from "@jsinfo/lib/formatting";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";

// Add this at the top of your file - you'd need to put this in a CSS module
<style jsx>{`
  .no-underline {
    text-decoration: none !important;
  }
  .provider-link:hover .no-underline {
    text-decoration: none !important;
  }
`}</style>

// Medal component for top 3 providers
const RankMedal = ({ rank }: { rank: number }) => {
  if (rank > 3) return null;

  const medalColors = {
    1: '#FFD700', // Gold
    2: '#C0C0C0', // Silver
    3: '#CD7F32'  // Bronze
  };

  const medalEmojis = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };

  return (
    <span
      style={{
        marginRight: '4px',
        color: medalColors[rank as 1 | 2 | 3],
        display: 'inline-block',
        textDecoration: 'none',
        pointerEvents: 'none' // This prevents hover effects
      }}
    >
      {medalEmojis[rank as 1 | 2 | 3]}
    </span>
  );
};

// ProviderWithAvatar without the medal component
const ProviderWithAvatar = ({ provider }: { provider: any }) => {
  const avatarUrl = provider.avatarUrl

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          width={20}
          height={20}
          alt="provider avatar"
          style={{
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      )}
      {IsMeaningfulText(provider.moniker) ? provider.moniker : provider.provider}
    </div>
  );
};

const ProvidersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProvidersCount = async () => {
    try {
      const countData = (await JsinfobeAxiosGet("item-count/indexProvidersActiveV2")).data;
      setTotalPages(Math.ceil(countData.itemCount / 20));
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  useEffect(() => {
    fetchProvidersCount();
  }, [currentPage]);

  const { data, error, isLoading } = useJsinfobeFetch(
    `indexProvidersActiveV2?pagination=rank,a,${currentPage},20`
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
            <TableHead style={{ whiteSpace: 'nowrap' }}>Rank</TableHead>
            <TableHead style={{ whiteSpace: 'nowrap' }}>Moniker</TableHead>
            <TableHead style={{ whiteSpace: 'nowrap' }}>Reputation Score</TableHead>
            <TableHead style={{ whiteSpace: 'nowrap' }}>Active Services</TableHead>
            <TableHead style={{ whiteSpace: 'nowrap' }}>Total Stake</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{provider.rank}</TableCell>
              <TableCell>
                <Link
                  className="orangelinks provider-link"
                  href={`/provider/${provider.provider}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="no-underline">
                    <RankMedal rank={provider.rank} />
                  </span>
                  <ProviderWithAvatar provider={provider} />
                </Link>
              </TableCell>
              <TableCell>
                <ModernTooltip title="Provider reputation score based on performance metrics">
                  {provider.formattedReputationScore}
                </ModernTooltip>
              </TableCell>
              <TableCell>
                <ModernTooltip title="Active chains serviced by the provider (non frozen services)">
                  {provider.activeServices}
                </ModernTooltip>
              </TableCell>
              <TableCell>
                <LavaWithTooltip amount={provider.activeAndInactiveStakeTotalRaw} />
              </TableCell>
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
