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

const servicesData: ServiceStats[] = [
  {
    name: 'Lava Network',
    uptime: 100,
    incidents: 0,
    lastIncident: null,
    color: 'text-green-500',
  },
  {
    name: 'AWS',
    uptime: 99.2,
    incidents: 3,
    lastIncident: '8 days ago',
    color: 'text-amber-500',
  },
  {
    name: 'Google Cloud',
    uptime: 99.5,
    incidents: 2,
    lastIncident: '10 days ago',
    color: 'text-blue-500',
  },
  {
    name: 'Azure',
    uptime: 98.9,
    incidents: 4,
    lastIncident: '5 days ago',
    color: 'text-purple-500',
  },
  {
    name: 'Cloudflare',
    uptime: 99.6,
    incidents: 2,
    lastIncident: '2 days ago',
    color: 'text-red-500',
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

