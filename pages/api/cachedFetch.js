// pages/api/cachedFetch.js

import { GetRestUrl } from '../../src/utils';

let cache = {};

// Clear expired entries from the cache every 5 minutes
setInterval(() => {
  console.log('Clearing expired entries from cache');
  for (const apiUrlPath in cache) {
      for (const apiUrlKey in cache[apiUrlPath]) {
          if (cache[apiUrlPath][apiUrlKey].expiry <= Date.now()) {
              delete cache[apiUrlPath][apiUrlKey];
          }
      }
  }
}, 5 * 60 * 1000);

async function getDataFromCacheOrFetch(apiUrlPath, apiUrlKey) {
  const cachedData = cache[apiUrlPath] && cache[apiUrlPath][apiUrlKey];
  if (cachedData) {
      console.log(`Fetching data from cache for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
      if (cachedData.expiry > Date.now()) {
          fetchAndCacheData(apiUrlPath, apiUrlKey);
          return cachedData.data;
      }
  }

  return fetchAndCacheData(apiUrlPath, apiUrlKey);
}

async function fetchAndCacheData(apiUrlPath, apiUrlKey) {
  const url = GetRestUrl() + "/" + (!apiUrlKey || apiUrlKey.trim() === '' ? apiUrlPath : apiUrlPath + '/' + apiUrlKey);
  const res = await fetch(url);
  if (!res.ok) {
      console.error(`Error fetching data from URL: ${url}`);
      return null;
  }

  const spec = await res.json();
  const expiry = Date.now() + Math.floor(Math.random() * 60 + 60) * 1000;
  cache[apiUrlPath] = { ...cache[apiUrlPath], [apiUrlKey]: { data: spec, expiry } };
  console.log(`Data fetched and cached for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
  return spec;
}

export default async function handler(req, res) {
  const { apiUrlPath, apiUrlKey } = req.query;
  const spec = await getDataFromCacheOrFetch(apiUrlPath, apiUrlKey);

  if (spec == null) {
    console.error(`Data not found for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    res.status(404).json({ error: 'Data not found' });
  } else {
    console.log(`Data found for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    res.status(200).json(spec);
  }
}