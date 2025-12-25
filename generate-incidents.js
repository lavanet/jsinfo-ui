#!/usr/bin/env node

/**
 * ========================================
 * RPC PROVIDER INCIDENTS GENERATOR
 * ========================================
 * Standalone script to fetch all incidents from RPC providers
 * and generate a JSON file in the same format as:
 * https://github.com/lavanet/jsinfo-ui/blob/testnet/all-blockchain-incidents.json
 * 
 * Usage: node generate-incidents.js
 * Output: all-blockchain-incidents.json
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ======================
// CONFIGURATION
// ======================

const PROVIDERS = [
    { name: 'Alchemy', url: 'https://status.alchemy.com', type: 'statuspage' },
    { name: 'Infura', url: 'https://status.infura.io', type: 'statuspage' },
    { name: 'QuickNode', url: 'https://status.quicknode.com', type: 'statuspage' },
    { name: 'Blockdaemon', url: 'https://status.blockdaemon.com', type: 'statuspage' },
    { name: 'Tenderly', url: 'https://status.tenderly.co', type: 'statuspage' },
    { name: 'Chainstack', url: 'https://status.chainstack.com', type: 'instatus-api' },
    { name: 'GetBlock', url: 'https://getblock.instatus.com', type: 'instatus' },
    { name: 'Ankr', url: 'https://ankr.instatus.com', type: 'instatus' },
    { name: 'Helius', url: 'https://helius.instatus.com', type: 'instatus' },
    { name: 'Nodies', url: 'https://nodies.instatus.com', type: 'instatus' },
    { name: 'Dwellir', url: 'https://dwellir.instatus.com', type: 'instatus' },
    { name: 'DRPC', url: 'https://status.drpc.org', type: 'betterstack' },
];

const MAX_PAGES_STATUSPAGE = 30;
const MAX_PAGES_INSTATUS = 5;
const MAX_PAGES_BETTERSTACK = 5;
const MAX_PAGES_INSTATUS_API = 12;
const PARALLEL_PAGES = 5;
const YEAR_2025_START = new Date('2025-01-01T00:00:00Z');
const OUTPUT_FILE = 'all-blockchain-incidents.json';

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Extract blockchain from incident name
 */
function extractChainFromName(name) {
    if (!name) return 'Other';
    
    const nameLower = name.toLowerCase();
    const chains = [
        'ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'solana',
        'avalanche', 'bnb', 'bsc', 'fantom', 'celo', 'gnosis', 'linea',
        'scroll', 'zksync', 'starknet', 'aptos', 'sui', 'near', 'cosmos',
        'zkevm', 'sepolia', 'amoy', 'testnet', 'mainnet', 'devnet',
        'hyperliquid', 'story', 'provenance', 'stellar', 'fusaka',
        'polkadot', 'flow', 'blast', 'tron', 'mantle', 'ink', 'sei',
        'hedera', 'vana', 'ton', 'morph', 'xrp', 'stacks', 'cardano'
    ];
    
    for (const chain of chains) {
        if (nameLower.includes(chain)) {
            return chain.charAt(0).toUpperCase() + chain.slice(1);
        }
    }
    
    return 'Other';
}

/**
 * Parse timestamp to ISO date
 */
function parseTimestamp(timestamp, monthName, year) {
    const cleanTimestamp = timestamp.replace(/<[^>]+>/g, '');
    const match = cleanTimestamp.match(/(\w+)\s+(\d+),\s+(\d+):(\d+)/);
    
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    if (match) {
        const [_, month, day, hour, minute] = match;
        const monthNum = months[month] || months[monthName] || '01';
        const dayNum = day.padStart(2, '0');
        const hourNum = hour.padStart(2, '0');
        const minuteNum = minute.padStart(2, '0');
        
        return `${year}-${monthNum}-${dayNum}T${hourNum}:${minuteNum}:00Z`;
    }
    
    const monthNum = months[monthName] || '01';
    return `${year}-${monthNum}-01T00:00:00Z`;
}

/**
 * Check if incident is from 2025
 */
function isFrom2025(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        return date >= YEAR_2025_START;
    } catch (e) {
        return false;
    }
}

// ======================
// FETCH FUNCTIONS
// ======================

/**
 * Fetch StatusPage.io provider (Alchemy, Infura, QuickNode, etc.)
 */
async function fetchHistoryPage(provider, page) {
    try {
        const response = await axios.get(`${provider.url}/history.json?page=${page}`, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const data = response.data;
        const incidents = [];
        
        if (data.months && Array.isArray(data.months)) {
            data.months.forEach(month => {
                if (month.incidents && Array.isArray(month.incidents)) {
                    month.incidents.forEach(inc => {
                        const timestamp = parseTimestamp(inc.timestamp, month.name, month.year);
                        if (isFrom2025(timestamp)) {
                            incidents.push({
                                provider: provider.name,
                                date: timestamp.substring(0, 10),
                                timestamp: timestamp,
                                impact: inc.impact || 'none',
                                chain: extractChainFromName(inc.name),
                                name: inc.name || 'Unnamed incident'
                            });
                        }
                    });
                }
            });
        }
        
        return incidents;
        
    } catch (error) {
        console.error(`  ❌ ${provider.name} page ${page} error: ${error.message}`);
        return [];
    }
}

/**
 * Fetch Chainstack (Instatus API)
 */
async function fetchChainstackPage(page) {
    try {
        const now = new Date();
        now.setMonth(now.getMonth() - (page - 1));
        now.setDate(1);
        const monthTimestamp = now.getTime();
        
        const url = `https://api.instatus.com/public/status.chainstack.com/notices/monthly/${monthTimestamp}?page_no=1`;
        const response = await axios.get(url, { timeout: 15000 });
        
        const incidents = [];
        if (response.data.month && response.data.month.notices) {
            response.data.month.notices.forEach(notice => {
                const incidentName = notice.name?.default || notice.name?.en || 'Unnamed incident';
                const timestamp = notice.started || notice.createdAt;
                
                if (isFrom2025(timestamp)) {
                    const affectedChains = [];
                    if (notice.components) {
                        notice.components.forEach(comp => {
                            const name = comp.name?.default || comp.name?.en || '';
                            const chain = extractChainFromName(name);
                            if (chain !== 'Other') affectedChains.push(chain);
                        });
                    }
                    
                    incidents.push({
                        provider: 'Chainstack',
                        date: timestamp.substring(0, 10),
                        timestamp: timestamp,
                        impact: notice.impact ? notice.impact.toLowerCase().replace('degradedperformance', 'minor') : 'none',
                        chain: affectedChains.length > 0 ? affectedChains[0] : 'Other',
                        name: incidentName
                    });
                }
            });
        }
        return incidents;
    } catch (error) {
        console.error(`  ❌ Chainstack page ${page} error: ${error.message}`);
        return [];
    }
}

/**
 * Fetch Instatus HTML providers (GetBlock, Ankr, etc.)
 */
async function fetchInstatusPage(provider, page) {
    try {
        const url = `${provider.url}/history/${page}`;
        const response = await axios.get(url, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(response.data);
        const incidents = [];
        const bodyText = $('body').text();
        const incidentSections = bodyText.split(/(?=Resolved|Identified|Investigating)/);
        
        incidentSections.forEach((section, i) => {
            const dateMatch = section.match(/([A-Z][a-z]+\s+\d{1,2},\s+202[0-9])/);
            if (!dateMatch) return;
            
            const parsedDate = new Date(dateMatch[1]);
            if (isNaN(parsedDate)) return;
            
            const date = parsedDate.toISOString().substring(0, 10);
            if (!isFrom2025(date)) return;
            
            const lines = section.split('\n').filter(l => l.trim().length > 0);
            let incidentName = `${provider.name} Service Incident`;
            
            for (let line of lines) {
                line = line.trim();
                if (line.length > 15 && line.length < 150 && 
                    !line.match(/Resolved|Identified|Investigating|Monitoring|Update|This incident|We are|We implemented|http|svg|icon|class|style/i)) {
                    incidentName = line;
                    break;
                }
            }
            
            let impact = 'minor';
            const lowerSection = section.toLowerCase();
            if (lowerSection.includes('critical') || lowerSection.includes('outage')) {
                impact = 'critical';
            } else if (lowerSection.includes('degraded') || lowerSection.includes('unavailable')) {
                impact = 'major';
            } else if (lowerSection.includes('maintenance')) {
                impact = 'maintenance';
            }
            
            incidents.push({
                provider: provider.name,
                date: date,
                timestamp: date,
                impact: impact,
                chain: extractChainFromName(incidentName + ' ' + section),
                name: incidentName
            });
        });
        
        return incidents;
    } catch (error) {
        console.error(`  ❌ ${provider.name} page ${page} error: ${error.message}`);
        return [];
    }
}

/**
 * Fetch DRPC (BetterStack)
 */
async function fetchDRPCPage(page) {
    try {
        const url = `https://status.drpc.org/history?page=${page}`;
        const response = await axios.get(url, { 
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const text = response.data;
        const incidents = [];
        const datePattern = /(\d{4}-\d{2}-\d{2})|([A-Z][a-z]{2}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+202[0-9])/g;
        const matches = [...text.matchAll(datePattern)];
        
        const seenDates = new Set();
        matches.forEach((match, i) => {
            const dateStr = match[0];
            const parsedDate = new Date(dateStr);
            
            if (!isNaN(parsedDate)) {
                const date = parsedDate.toISOString().substring(0, 10);
                
                if (!seenDates.has(date) && isFrom2025(date)) {
                    seenDates.add(date);
                    
                    const contextText = text.substring(Math.max(0, match.index - 200), match.index + 200);
                    const lowerContext = contextText.toLowerCase();
                    
                    let impact = 'minor';
                    if (lowerContext.includes('critical') || lowerContext.includes('outage')) {
                        impact = 'critical';
                    } else if (lowerContext.includes('degraded') || lowerContext.includes('major')) {
                        impact = 'major';
                    } else if (lowerContext.includes('maintenance')) {
                        impact = 'maintenance';
                    }
                    
                    incidents.push({
                        provider: 'DRPC',
                        date: date,
                        timestamp: date,
                        impact: impact,
                        chain: 'Other',
                        name: 'DRPC Service Incident'
                    });
                }
            }
        });
        
        return incidents;
    } catch (error) {
        console.error(`  ❌ DRPC page ${page} error: ${error.message}`);
        return [];
    }
}

/**
 * Fetch provider with parallel pages
 */
async function fetchProviderParallel(provider) {
    console.log(`\n📡 Fetching ${provider.name} (${provider.type})...`);
    
    const startTime = Date.now();
    const allIncidents = [];
    const seenIds = new Set();
    
    let fetchFunction;
    let maxPages;
    
    switch (provider.type) {
        case 'statuspage':
            fetchFunction = (page) => fetchHistoryPage(provider, page);
            maxPages = MAX_PAGES_STATUSPAGE;
            break;
        case 'instatus-api':
            fetchFunction = fetchChainstackPage;
            maxPages = MAX_PAGES_INSTATUS_API;
            break;
        case 'instatus':
            fetchFunction = (page) => fetchInstatusPage(provider, page);
            maxPages = MAX_PAGES_INSTATUS;
            break;
        case 'betterstack':
            fetchFunction = fetchDRPCPage;
            maxPages = MAX_PAGES_BETTERSTACK;
            break;
        default:
            console.log(`  ⚠️ Unknown provider type: ${provider.type}`);
            return [];
    }
    
    for (let batchStart = 1; batchStart <= maxPages; batchStart += PARALLEL_PAGES) {
        const batchEnd = Math.min(batchStart + PARALLEL_PAGES - 1, maxPages);
        const pages = [];
        
        for (let page = batchStart; page <= batchEnd; page++) {
            pages.push(page);
        }
        
        const results = await Promise.all(
            pages.map(page => fetchFunction(page).catch(err => {
                console.error(`  ❌ Page ${page} failed:`, err.message);
                return [];
            }))
        );
        
        results.forEach(incidents => {
            incidents.forEach(inc => {
                const id = `${inc.provider}-${inc.date}-${inc.name}`;
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    allIncidents.push(inc);
                }
            });
        });
        
        await new Promise(r => setTimeout(r, 500));
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ✅ ${provider.name}: ${allIncidents.length} incidents in ${duration}s`);
    
    return allIncidents;
}

// ======================
// MAIN FUNCTION
// ======================

async function main() {
    console.log('🚀 Starting RPC Provider Incidents Generator');
    console.log(`📅 Fetching incidents from 2025-01-01 to ${new Date().toISOString().substring(0, 10)}`);
    console.log(`📦 Fetching from ${PROVIDERS.length} providers...\n`);
    
    const overallStart = Date.now();
    
    // Fetch all providers in parallel
    const results = await Promise.all(
        PROVIDERS.map(provider => fetchProviderParallel(provider))
    );
    
    // Combine all incidents
    const allIncidents = results.flat();
    
    // Sort by date (newest first)
    allIncidents.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date);
        const dateB = new Date(b.timestamp || b.date);
        return dateB - dateA;
    });
    
    // Calculate summary
    const summary = {
        by_impact: {
            critical: 0,
            minor: 0,
            maintenance: 0,
            major: 0
        },
        total_incidents: allIncidents.length
    };
    
    allIncidents.forEach(inc => {
        const impact = inc.impact || 'none';
        if (summary.by_impact[impact] !== undefined) {
            summary.by_impact[impact]++;
        }
    });
    
    // Get unique providers
    const uniqueProviders = [...new Set(allIncidents.map(inc => inc.provider))].sort();
    
    // Generate output JSON
    const output = {
        summary: summary,
        incidents: allIncidents,
        metadata: {
            providers: uniqueProviders,
            description: 'All RPC provider incidents for 2025',
            generated: new Date().toISOString(),
            year: 2025
        }
    };
    
    // Write to file
    const outputPath = path.join(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 4), 'utf8');
    
    const totalDuration = ((Date.now() - overallStart) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Total incidents: ${allIncidents.length}`);
    console.log(`   - Critical: ${summary.by_impact.critical}`);
    console.log(`   - Major: ${summary.by_impact.major}`);
    console.log(`   - Minor: ${summary.by_impact.minor}`);
    console.log(`   - Maintenance: ${summary.by_impact.maintenance}`);
    console.log(`\n📦 Providers: ${uniqueProviders.join(', ')}`);
    console.log(`\n⏱️  Total time: ${totalDuration}s`);
    console.log(`\n💾 File saved: ${outputPath}`);
    console.log('='.repeat(60));
}

// Run the script
if (require.main === module) {
    main().catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
}

module.exports = { main };

