// src/app/usage/_components/UptimeChart.tsx

"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import incidentsData from '../../../../critical-major-incidents.json';

interface Incident {
  provider: string;
  date: string;
  timestamp: string;
  impact: string;
  chain: string;
  name: string;
}

// Extract blockchain name from incident name or chain field
const extractBlockchainName = (incident: Incident): string => {
  const name = incident.name.toLowerCase();
  const chain = incident.chain;
  
  // If chain is specific (not generic), use it
  const genericTerms = ['mainnet', 'testnet', 'other', 'sepolia', 'goerli'];
  if (chain && !genericTerms.includes(chain.toLowerCase())) {
    return chain;
  }
  
  // Extract blockchain name from incident name
  const blockchainKeywords = [
    'ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'solana', 
    'avalanche', 'bsc', 'bnb', 'cosmos', 'starknet', 'zksync', 'linea',
    'celo', 'near', 'aurora', 'fantom', 'harmony', 'aptos', 'stellar',
    'algorand', 'flow', 'filecoin', 'palm', 'xrp', 'btc', 'bitcoin',
    'ton', 'sui', 'zkevm', 'scroll', 'mantle', 'blast', 'zora',
    'redstone', 'sei', 'swell', 'unichain', 'monad', 'sonic', 'story',
    'xlayer', 'flare', 'oasis', 'dash', 'dogecoin', 'litecoin', 'tezos'
  ];
  
  for (const keyword of blockchainKeywords) {
    if (name.includes(keyword)) {
      // Capitalize first letter
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  // If nothing found, check if it's a network issue
  if (name.includes('network') || name.includes('nodes') || name.includes('rpc')) {
    return 'Multi-chain';
  }
  
  // Fallback to original chain value but filter out generic terms
  if (chain && !genericTerms.includes(chain.toLowerCase())) {
    return chain;
  }
  
  return 'Infrastructure';
};

// Process blockchain incidents from the JSON file
const processBlockchainIncidents = () => {
  const incidents = incidentsData.incidents as Incident[];
  const incidentsByDate: { [date: string]: { count: number; chains: Set<string> } } = {};
  
  // Only process incidents from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  incidents.forEach(incident => {
    const incidentDate = new Date(incident.date);
    if (incidentDate >= thirtyDaysAgo) {
      const dateKey = incident.date;
      if (!incidentsByDate[dateKey]) {
        incidentsByDate[dateKey] = { count: 0, chains: new Set<string>() };
      }
      incidentsByDate[dateKey].count++;
      
      // Extract meaningful blockchain name
      const blockchainName = extractBlockchainName(incident);
      incidentsByDate[dateKey].chains.add(blockchainName);
    }
  });
  
  return incidentsByDate;
};

// Mock data representing uptime percentage over time
const generateUptimeData = () => {
  const data = [];
  const blockchainIncidents = processBlockchainIncidents();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dataPoint: any = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: date.getTime(),
      fullDate: dateStr,
    };

    // Lava Network - Perfect uptime (100%)
    dataPoint['Lava Network'] = 100;

    // Blockchain RPC Providers - Based on real incidents
    const dayIncidents = blockchainIncidents[dateStr];
    if (dayIncidents) {
      // Calculate uptime degradation based on incident count and severity
      const impactFactor = Math.min(dayIncidents.count * 0.8, 5); // Max 5% impact per day
      dataPoint['Blockchain RPCs'] = Math.max(95, 100 - impactFactor);
      dataPoint['affectedChains'] = Array.from(dayIncidents.chains).join(', ');
      dataPoint['incidentCount'] = dayIncidents.count;
    } else {
      dataPoint['Blockchain RPCs'] = 100;
      dataPoint['affectedChains'] = '';
      dataPoint['incidentCount'] = 0;
    }

    // AWS - Occasional incidents
    dataPoint['AWS'] = i === 5 ? 97.5 : i === 15 ? 98.2 : i === 22 ? 96.8 : 100;

    // Google Cloud - Rare incidents
    dataPoint['Google Cloud'] = i === 10 ? 98.5 : i === 20 ? 97.9 : 100;

    // Azure - Some incidents
    dataPoint['Azure'] = i === 8 ? 95.5 : i === 18 ? 97.2 : i === 25 ? 98.1 : 100;

    // Cloudflare - Minor incidents
    dataPoint['Cloudflare'] = i === 12 ? 99.1 : i === 28 ? 98.8 : 100;

    data.push(dataPoint);
  }

  return data;
};

const uptimeData = generateUptimeData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg max-w-sm">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}:</span>
            <span className="font-semibold">{entry.value.toFixed(2)}%</span>
          </div>
        ))}
        
        {/* Show affected chains for Blockchain RPCs */}
        {dataPoint?.affectedChains && dataPoint.incidentCount > 0 && (
          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
            <p className="font-semibold text-red-500">
              {dataPoint.incidentCount} incident{dataPoint.incidentCount > 1 ? 's' : ''}
            </p>
            <p className="mt-1">
              <span className="font-medium">Affected chains:</span>
              <br />
              <span className="text-orange-400">{dataPoint.affectedChains}</span>
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function UptimeChart() {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={uptimeData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            domain={[95, 100]}
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            label={{ value: 'Uptime %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="Lava Network"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Blockchain RPCs"
            stroke="#ec4899"
            strokeWidth={2.5}
            dot={{ fill: '#ec4899', r: 3.5 }}
            activeDot={{ r: 5 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="AWS"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Google Cloud"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Azure"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Cloudflare"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

