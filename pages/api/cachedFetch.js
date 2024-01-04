// pages/api/cachedFetch.js

import { GetRestUrl } from '../../src/utils';

import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3 });

let cache = {};

// Clear expired entries from the cache every minute
setInterval(() => {
  console.log('Clearing expired entries from cache');
  for (const apiUrlPath in cache) {
    for (const apiUrlKey in cache[apiUrlPath]) {
      if (cache[apiUrlPath][apiUrlKey].expiry <= Date.now()) {
        delete cache[apiUrlPath][apiUrlKey];
      }
    }
  }
}, 1 * 60 * 1000);

async function getDataFromCacheOrFetch(apiUrlPath, apiUrlKey) {
  const cachedData = cache[apiUrlPath] && cache[apiUrlPath][apiUrlKey];
  if (cachedData) {
    console.log(`Fetching data from cache for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    if (cachedData.expiry > Date.now()) {
      fetchAndCacheData(apiUrlPath, apiUrlKey); // Fetch new data in the background
      return cachedData.data;
    }
  }

  return fetchAndCacheData(apiUrlPath, apiUrlKey);
}

async function fetchAndCacheData(apiUrlPath, apiUrlKey) {
  const url = GetRestUrl() + "/" + (!apiUrlKey || apiUrlKey.trim() === '' ? apiUrlPath : apiUrlPath + '/' + apiUrlKey);
  try {
    const res = await axios.get(url, { timeout: 5000 }); // 5 seconds timeout
    const resData = res.data;

    if (Object.keys(resData).length === 0 || (typeof resData === 'string' && resData.trim() === '{}')) {
      console.log(`CachedFetch: Data for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey} is empty. Not updating cache.`);
      return {};
    }

    const expiry = Date.now() + Math.floor(Math.random() * 60 + 60) * 1000;
    cache[apiUrlPath] = { ...cache[apiUrlPath], [apiUrlKey]: { data: resData, expiry } };
    console.log(`CachedFetch: Data fetched and cached for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    return resData;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`CachedFetch: Timeout error. The request for ${url} took longer than 5000ms to respond.`);
    } else {
      console.error(`CachedFetch: Error fetching data from URL: ${url}. Error: ${error.message}`);
    }
    return {};
  }
}

export default async function handler(req, res) {
  const { apiUrlPath, apiUrlKey } = req.query;
  const resData = await getDataFromCacheOrFetch(apiUrlPath, apiUrlKey);

  if (resData == null) {
    console.error(`Data not found for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    res.status(404).json({ error: 'Data not found' });
  } else {
    console.log(`Data found for apiUrlPath: ${apiUrlPath} and apiUrlKey: ${apiUrlKey}`);
    res.status(200).json(resData);
  }
}