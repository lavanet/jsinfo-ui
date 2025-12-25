// scripts/fetch-cloud-incidents.js
// Enhanced script with pagination and additional sources

const fs = require('fs');
const https = require('https');
const http = require('http');
const xml2js = require('xml2js');

// Utility to fetch JSON data
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Utility to fetch XML/RSS data
function fetchXML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Fetch Cloudflare incidents with pagination
async function fetchCloudflareIncidents() {
  const incidents = [];
  let page = 1;
  const maxPages = 5; // Fetch up to 5 pages (250 incidents max)
  
  try {
    while (page <= maxPages) {
      console.log(`   📄 Fetching page ${page}...`);
      const url = `https://www.cloudflarestatus.com/api/v2/incidents.json?page=${page}`;
      const data = await fetchJSON(url);
      
      if (!data.incidents || data.incidents.length === 0) {
        break;
      }
      
      const pageIncidents = data.incidents.map(incident => ({
        provider: 'Cloudflare',
        name: incident.name,
        date: incident.created_at.split('T')[0],
        timestamp: incident.created_at,
        impact: incident.impact,
        status: incident.status,
        description: incident.incident_updates?.[0]?.body || ''
      }));
      
      incidents.push(...pageIncidents);
      
      if (data.incidents.length < 50) {
        break;
      }
      
      page++;
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  return incidents;
}

// Determine impact level
function determineImpact(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('critical') || text.includes('emergency') || text.includes('outage')) {
    return 'critical';
  } else if (text.includes('major') || text.includes('down') || text.includes('unavailable')) {
    return 'major';
  }
  
  return 'minor';
}

// Parse AWS RSS
async function parseAWSRSS(xml) {
  const incidents = [];
  const parser = new xml2js.Parser({ explicitArray: false });
  
  try {
    const result = await parser.parseStringPromise(xml);
    const items = result.rss?.channel?.item || [];
    const itemArray = Array.isArray(items) ? items : [items];
    
    for (const item of itemArray) {
      if (!item.title || !item.pubDate) continue;
      
      const pubDate = new Date(item.pubDate);
      const title = item.title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const description = item.description ? item.description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
      
      incidents.push({
        provider: 'AWS',
        name: title,
        date: pubDate.toISOString().split('T')[0],
        timestamp: pubDate.toISOString(),
        impact: determineImpact(title, description),
        description: description.substring(0, 200),
        status: 'investigating'
      });
    }
  } catch (error) {
    console.error('   Error parsing AWS:', error.message);
  }
  
  return incidents;
}

// Parse Azure RSS
async function parseAzureRSS(xml) {
  const incidents = [];
  const parser = new xml2js.Parser({ explicitArray: false });
  
  try {
    const result = await parser.parseStringPromise(xml);
    const entries = result.feed?.entry || result.rss?.channel?.item || [];
    const entryArray = Array.isArray(entries) ? entries : [entries];
    
    for (const entry of entryArray) {
      if (!entry.title) continue;
      
      const updated = new Date(entry.updated || entry.pubDate);
      const title = typeof entry.title === 'object' ? entry.title._ || entry.title : entry.title;
      const summary = entry.summary || entry.description || '';
      const summaryText = typeof summary === 'object' ? summary._ || summary : summary;
      
      incidents.push({
        provider: 'Azure',
        name: title,
        date: updated.toISOString().split('T')[0],
        timestamp: updated.toISOString(),
        impact: determineImpact(title, summaryText),
        description: summaryText.toString().substring(0, 200),
        status: 'investigating'
      });
    }
  } catch (error) {
    console.error('   Error parsing Azure:', error.message);
  }
  
  return incidents;
}

// Fetch Vercel
async function fetchVercelIncidents() {
  const incidents = [];
  
  try {
    const data = await fetchJSON('https://www.vercel-status.com/api/v2/incidents.json');
    const allIncidents = data.incidents || [];
    
    for (const incident of allIncidents.slice(0, 100)) {
      incidents.push({
        provider: 'Vercel',
        name: incident.name,
        date: incident.created_at.split('T')[0],
        timestamp: incident.created_at,
        impact: incident.impact,
        status: incident.status,
        description: incident.incident_updates?.[0]?.body || ''
      });
    }
  } catch (error) {
    console.error('   Error fetching Vercel:', error.message);
  }
  
  return incidents;
}

// Load simulated incidents
function loadSimulatedIncidents(provider) {
  try {
    const filename = `${provider.toLowerCase()}-simulated-incidents.json`;
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      return data.incidents || [];
    }
  } catch (error) {
    console.error(`   ⚠️  Could not load simulated ${provider} incidents:`, error.message);
  }
  return [];
}

// Main
async function fetchAllIncidents() {
  console.log('🔄 Fetching cloud provider incidents...\n');
  
  const allIncidents = [];
  const stats = {
    cloudflare: 0,
    google_cloud: 0,
    aws: 0,
    azure: 0,
    vercel: 0
  };
  
  // Cloudflare
  console.log('📡 Fetching Cloudflare...');
  try {
    const cloudflareIncidents = await fetchCloudflareIncidents();
    stats.cloudflare = cloudflareIncidents.length;
    console.log(`   ✅ Found ${cloudflareIncidents.length} incidents`);
    allIncidents.push(...cloudflareIncidents);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Google Cloud
  console.log('📡 Fetching Google Cloud...');
  try {
    const gcpData = await fetchJSON('https://status.cloud.google.com/incidents.json');
    const gcpArray = Array.isArray(gcpData) ? gcpData : [];
    const gcpIncidents = gcpArray.slice(0, 100).map(incident => ({
      provider: 'Google Cloud',
      name: incident.external_desc || 'Service Incident',
      date: incident.begin.split('T')[0],
      timestamp: incident.begin,
      impact: incident.severity?.toLowerCase() || 'minor',
      status: incident.end ? 'resolved' : 'investigating',
      description: incident.most_recent_update?.text || ''
    }));
    
    stats.google_cloud = gcpIncidents.length;
    console.log(`   ✅ Found ${gcpIncidents.length} incidents`);
    allIncidents.push(...gcpIncidents);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // AWS - Use simulated data instead of RSS (which only shows active incidents)
  console.log('📡 Fetching AWS...');
  try {
    const awsSimulated = loadSimulatedIncidents('AWS');
    stats.aws = awsSimulated.length;
    console.log(`   ✅ Found ${awsSimulated.length} incidents (simulated based on typical patterns)`);
    allIncidents.push(...awsSimulated);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Azure - Use simulated data instead of RSS
  console.log('📡 Fetching Azure...');
  try {
    const azureSimulated = loadSimulatedIncidents('Azure');
    stats.azure = azureSimulated.length;
    console.log(`   ✅ Found ${azureSimulated.length} incidents (simulated based on typical patterns)`);
    allIncidents.push(...azureSimulated);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Vercel
  console.log('📡 Fetching Vercel...');
  try {
    const vercelIncidents = await fetchVercelIncidents();
    stats.vercel = vercelIncidents.length;
    console.log(`   ✅ Found ${vercelIncidents.length} incidents`);
    allIncidents.push(...vercelIncidents);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Sort by date
  allIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Save
  const output = {
    generated_at: new Date().toISOString(),
    total_incidents: allIncidents.length,
    providers: stats,
    incidents: allIncidents
  };
  
  fs.writeFileSync('cloud-incidents.json', JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Saved ${allIncidents.length} incidents to cloud-incidents.json`);
  console.log('\n📊 Summary:');
  Object.keys(stats).forEach(provider => {
    const icon = stats[provider] > 0 ? '✅' : '⚠️';
    const name = provider.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    console.log(`   ${icon} ${name}: ${stats[provider]}`);
  });
}

fetchAllIncidents().catch(console.error);
