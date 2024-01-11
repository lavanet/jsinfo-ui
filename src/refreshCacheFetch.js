// src/refreshCacheFetch.ts

const axios = require('axios');

const restUrl = process.env['REST_URL'];
console.log(`RevalidateCache - REST_URL: ${restUrl}`);

const axiosInstance = axios.create({
    baseURL: restUrl,
});

const retryAxiosGet = async (url, retries = 2) => {
    for (let i = 0; i < retries; i++) {
      const response = await axiosInstance.get(url);
      if (Object.keys(response.data).length !== 0) {
        return response;
      }
    }
    return null;
  };
  
  const revalidateCacheForSpecs = async () => {
    console.log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for specs...`);
    const response = await retryAxiosGet('/specs');
    if (!response) return;
    const specs = response.data.specs;
  
    for (const spec of specs) {
      await axiosInstance.get(`/spec/${spec.id}`);
    }
  };
  
  const revalidateCacheForConsumers = async () => {
    console.log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for consumers...`);
    const response = await retryAxiosGet('/consumers');
    if (!response) return;
    const consumers = response.data.consumers;
  
    for (const consumer of consumers) {
      await axiosInstance.get(`/consumer/${consumer.address}`);
    }
  };
  
  const revalidateCacheForProviders = async () => {
    console.log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for providers...`);
    const response = await retryAxiosGet('/providers');
    if (!response) return;
    const providers = response.data.providers;
  
    for (const provider of providers) {
      await axiosInstance.get(`/provider/${provider.address}`);
    }
  };

const revalidateCache = async () => {
    // Check if we're running on the client-side
    if (typeof window !== 'undefined') {
        throw new Error('This code should not be run on the client-side.');
    }

    console.log(`RevalidateCache - ${new Date().toISOString()} - Starting revalidation of cache...`);
    await revalidateCacheForSpecs();
    await revalidateCacheForConsumers();
    await revalidateCacheForProviders();
    console.log(`RevalidateCache - ${new Date().toISOString()} - Finished revalidation of cache.`);
};

const StartRevalidateCacheLoop = () => {
    // Call revalidateCacheForData on application load
    revalidateCache();
  
    // Call revalidateCacheForData every 4-5 minutes
    setInterval(revalidateCache, 5 * 60 * 1000);
};

// Start the revalidation loop
StartRevalidateCacheLoop();