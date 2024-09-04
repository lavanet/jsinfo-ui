// src/components/sections/ProviderPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jsinfo/components/radixui/Card";
import { Button } from "@jsinfo/components/radixui/Button";
import { UsageGraph } from "@jsinfo/app/_components/UsageGraph";
import { ProviderHealthTable } from "@jsinfo/components/sections/ProviderHealthTable";

interface ProviderData {
  moniker?: string;
  provider?: string;
}

interface ProviderCards {
  cuSum?: number;
  relaySum?: number;
  rewardSum?: number;
  stakeSum?: number;
  claimableRewards?: number;
  claimedRewardsAllTime?: number;
  claimedRewards30DaysAgo?: number;
}

const ProviderPage = ({ address }: { address: string }) => {
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [providerCards, setProviderCards] = useState<ProviderCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchProviderData(address);
      fetchProviderCards(address);
    }
  }, [address]);

  const fetchProviderData = async (address: string) => {
    try {
      const response = await fetch(`https://jsinfo.lavanet.xyz/provider/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider data');
      }
      const data = await response.json();
      setProviderData(data);
    } catch (error) {
      console.error('Error fetching provider data:', error);
      setError('Failed to fetch provider data');
    }
  };

  const fetchProviderCards = async (address: string) => {
    try {
      const response = await fetch(`https://jsinfo.lavanet.xyz/providerCards/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider cards');
      }
      const data = await response.json();
      setProviderCards(data);
    } catch (error) {
      console.error('Error fetching provider cards:', error);
      setError('Failed to fetch provider metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link className='orangelinks' href="/" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-4">{providerData?.moniker || 'Unknown Provider'}</h1>
      <p className="text-muted-foreground mb-8">Address: {providerData?.provider || address}</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        <MetricCard title="Total CUs" value={providerCards?.cuSum} />
        <MetricCard title="Total Relays" value={providerCards?.relaySum} />
        <MetricCard title="Total Rewards" value={providerCards?.rewardSum} divisor={1000000} suffix=" LAVA" />
        <MetricCard title="Total Stake" value={providerCards?.stakeSum} divisor={1000000} suffix=" LAVA" />
        <MetricCard title="Claimable Rewards" value={providerCards?.claimableRewards} divisor={1000000} suffix=" LAVA" />
        <MetricCard title="Claimed Rewards (All Time)" value={providerCards?.claimedRewardsAllTime} divisor={1000000} suffix=" LAVA" />
        <MetricCard title="Claimed Rewards (Last 30 Days)" value={providerCards?.claimedRewards30DaysAgo} divisor={1000000} suffix=" LAVA" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Provider Performance</CardTitle>
          <CardDescription>QoS scores and relay counts for each chain</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageGraph providerId={providerData?.provider} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider Health</CardTitle>
          <CardDescription>Recent health status for provider services</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderHealthTable providerId={providerData?.provider} />
        </CardContent>
      </Card>
    </div>
  );
};

type MetricCardProps = {
  title: string;
  value: React.ReactNode | null | string;
  divisor?: number;
  suffix?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, divisor = 1, suffix = '' }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value !== undefined
          ? (Number(value) / divisor).toLocaleString() + suffix
          : 'N/A'}
      </div>
    </CardContent>
  </Card>
);

export default ProviderPage;