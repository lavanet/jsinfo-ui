// src/app/usage/_components/IncidentStats.tsx

"use client";

import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface ServiceStats {
  name: string;
  uptime: number;
  incidents: number;
  lastIncident: string | null;
  color: string;
}

// Calculated from UptimeChart data (30-day average)
// Formula: (sum of daily uptime) / 30 days
const servicesData: ServiceStats[] = [
  {
    name: 'Lava Network',
    uptime: 100,              // 30 days × 100% = 100%
    incidents: 0,
    lastIncident: null,
    color: 'text-green-500',
  },
  {
    name: 'Cloudflare',
    uptime: 99.93,            // (28×100 + 99.1 + 98.8) / 30 = 99.93%
    incidents: 2,             // Days 12, 28
    lastIncident: '2 days ago',
    color: 'text-red-500',
  },
  {
    name: 'Google Cloud',
    uptime: 99.88,            // (28×100 + 98.5 + 97.9) / 30 = 99.88%
    incidents: 2,             // Days 10, 20
    lastIncident: '10 days ago',
    color: 'text-blue-500',
  },
  {
    name: 'AWS',
    uptime: 99.75,            // (27×100 + 97.5 + 98.2 + 96.8) / 30 = 99.75%
    incidents: 3,             // Days 5, 15, 22
    lastIncident: '8 days ago',
    color: 'text-amber-500',
  },
  {
    name: 'Azure',
    uptime: 99.69,            // (27×100 + 95.5 + 97.2 + 98.1) / 30 = 99.69%
    incidents: 3,             // Days 8, 18, 25
    lastIncident: '5 days ago',
    color: 'text-purple-500',
  },
];

export default function IncidentStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servicesData.map((service) => (
        <div
          key={service.name}
          className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{service.name}</h3>
            {service.incidents === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime (30d)</span>
              <span className={`font-bold ${service.color}`}>
                {service.uptime}%
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  service.uptime === 100
                    ? 'bg-green-500'
                    : service.uptime >= 99.5
                    ? 'bg-blue-500'
                    : service.uptime >= 99
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${service.uptime}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Incidents</span>
              <span className="font-semibold">
                {service.incidents === 0 ? (
                  <span className="text-green-500">No incidents</span>
                ) : (
                  <span className="text-amber-500">{service.incidents} reported</span>
                )}
              </span>
            </div>

            {service.lastIncident && (
              <div className="text-xs text-muted-foreground">
                Last incident: {service.lastIncident}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

