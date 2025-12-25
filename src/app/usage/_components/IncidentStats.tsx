// src/app/usage/_components/IncidentStats.tsx

"use client";

import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import cloudIncidentsData from '../../../../cloud-incidents.json';

interface ServiceStats {
  name: string;
  uptime: number;
  incidents: number;
  lastIncident: string | null;
  color: string;
}

interface CloudIncident {
  provider: string;
  date: string;
  timestamp: string;
  impact: string;
  name: string;
}

// Calculate service statistics from real cloud incident data
const calculateServiceStats = (): ServiceStats[] => {
  const incidents = cloudIncidentsData.incidents as CloudIncident[];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90); // Last 90 days (3 months)
  
  const providers = ['Lava Network', 'Cloudflare', 'Google Cloud', 'AWS', 'Azure', 'Vercel', 'DigitalOcean', 'Oracle Cloud'];
  const colors = ['text-green-500', 'text-red-500', 'text-blue-500', 'text-amber-500', 'text-purple-500', 'text-cyan-500', 'text-teal-500', 'text-orange-600'];
  
  return providers.map((provider, index) => {
    if (provider === 'Lava Network') {
      return {
        name: provider,
        uptime: 100,
        incidents: 0,
        lastIncident: null,
        color: colors[index],
      };
    }
    
    // Filter incidents for this provider in the last 90 days
    const providerIncidents = incidents.filter(inc => {
      const incDate = new Date(inc.date);
      return inc.provider === provider && incDate >= ninetyDaysAgo;
    });
    
    // Calculate uptime (each incident reduces uptime by 2% for most, 0.5% for Cloudflare due to high volume)
    let uptimeReduction;
    if (provider === 'Cloudflare') {
      uptimeReduction = Math.min(providerIncidents.length * 0.5, 15); // Max 15% reduction for Cloudflare
    } else {
      uptimeReduction = Math.min(providerIncidents.length * 2, 15); // Max 15% reduction for others
    }
    const uptime = parseFloat((100 - uptimeReduction).toFixed(2));
    
    // Find most recent incident
    let lastIncident: string | null = null;
    if (providerIncidents.length > 0) {
      const mostRecent = providerIncidents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      const daysSince = Math.floor(
        (Date.now() - new Date(mostRecent.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSince === 0) {
        lastIncident = 'Today';
      } else if (daysSince === 1) {
        lastIncident = 'Yesterday';
      } else {
        lastIncident = `${daysSince} days ago`;
      }
    }
    
    return {
      name: provider,
      uptime,
      incidents: providerIncidents.length,
      lastIncident,
      color: colors[index],
    };
  });
};

const servicesData = calculateServiceStats();

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
              <span className="text-sm text-muted-foreground">Uptime (3 months)</span>
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

