// src/app/usage/page.tsx

"use client";

import React, { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import UptimeChart from "./_components/UptimeChart";
import IncidentStats from "./_components/IncidentStats";
import { Activity, TrendingUp, Shield } from "lucide-react";

export default function UsagePage() {
  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('usage');
  }, [setCurrentPage]);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Network Uptime & Reliability</h1>
        <p className="text-muted-foreground">
          Compare Lava Network's uptime performance against major cloud providers
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Lava Uptime</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">100%</p>
          <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Lava Total Incidents</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-1">No downtime reported</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Lava Reliability Score</h3>
          </div>
          <p className="text-3xl font-bold text-purple-500">A+</p>
          <p className="text-xs text-muted-foreground mt-1">Industry leading</p>
        </div>
      </div>

      {/* Uptime Comparison Chart */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Uptime Comparison (Last 30 Days)</h2>
          <p className="text-sm text-muted-foreground">
            Real-time comparison of network reliability across major infrastructure providers.
            The <span className="text-pink-400 font-medium">Blockchain RPCs</span> line shows real incidents from major RPC providers,
            displaying which blockchain networks were affected (hover for details).
          </p>
        </div>
        <UptimeChart />
        
        {/* Legend / Note */}
        <div className="mt-4 p-4 bg-muted/50 rounded-md text-xs text-muted-foreground">
          <p className="font-semibold mb-1">📊 Data Insights:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li><span className="font-medium text-green-400">Lava Network</span>: Zero downtime, 100% uptime maintained</li>
            <li><span className="font-medium text-pink-400">Blockchain RPCs</span>: Aggregated incidents from major RPC providers - chains affected shown on hover</li>
            <li>Cloud providers data represents typical infrastructure reliability patterns</li>
          </ul>
        </div>
      </div>

      {/* Service Statistics */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Service Statistics</h2>
          <p className="text-sm text-muted-foreground">
            Detailed uptime metrics and incident reports for each service
          </p>
        </div>
        <IncidentStats />
      </div>
    </div>
  );
}

