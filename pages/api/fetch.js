import { GetRestUrl } from '../../src/utils';

let cache = {};

async function getData(dataKey, apiKey) {
    const cachedData = cache[dataKey] && cache[dataKey][apiKey];
    if (cachedData && cachedData.expiry > Date.now()) {
        console.log(`Fetching data from cache for dataKey: ${dataKey} and apiKey: ${apiKey}`);
        return cachedData.data;
    }

    const url = GetRestUrl() + "/" + (!apiKey || apiKey.trim() === '' ? dataKey : dataKey + '/' + apiKey);
    const res = await fetch(url);
    if (!res.ok) {
        console.error(`Error fetching data from URL: ${url}`);
        return null;
    }

    const spec = await res.json();
    const expiry = Date.now() + Math.floor(Math.random() * 60 + 60) * 1000;
    cache[dataKey] = { ...cache[dataKey], [apiKey]: { data: spec, expiry } };
    console.log(`Data fetched and cached for dataKey: ${dataKey} and apiKey: ${apiKey}`);
    return spec;
}

export default async function handler(req, res) {
  const { datakey, apikey } = req.query;
  const spec = await getData(datakey, apikey);

  if (spec == null) {
    console.error(`Data not found for dataKey: ${datakey} and apiKey: ${apikey}`);
    res.status(404).json({ error: 'Data not found' });
  } else {
    console.log(`Data found for dataKey: ${datakey} and apiKey: ${apikey}`);
    res.status(200).json(spec);
  }
}