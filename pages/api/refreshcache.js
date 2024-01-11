// pages/api/refreshCacheFetch.js

import { GetRestUrl } from '../../src/utils';
const axios = require('axios');

let logs = [];

const log = (message) => {
    console.log(message);
    logs.push(message);
    if (logs.length > 500) {
        logs.shift();
    }
};

const log_error = (message, err) => {
    console.error(message, err);
    log(`${message} ${err}`);
};

const restUrl = GetRestUrl();
log(`RevalidateCache - REST_URL: ${restUrl}`);

const axiosInstance = axios.create({
    baseURL: restUrl,
    timeout: 500,
});

const retryAxiosGet = async (url, retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axiosInstance.get(url);
            if (Object.keys(response.data).length !== 0) {
                return response;
            }
        } catch (error) {
            log_error(`Error fetching data from ${url}:`, error?.message);
        }

        // Wait for 500ms before the next try
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    return null;
};

const revalidateCacheForSpecs = async () => {
    log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for specs...`);
    const response = await retryAxiosGet('/specs');
    if (!response || !response.data.specs) return;
    const specs = response.data.specs;

    for (const spec of specs) {
        if (!spec.id) continue;
        try {
            await axiosInstance.get(`/spec/${spec.id}`);
        } catch (error) {
            log_error(`Error fetching spec ${spec.id}:`, error?.message);
        }
    }
};

const revalidateCacheForConsumers = async () => {
    log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for consumers...`);
    const response = await retryAxiosGet('/consumers');
    if (!response || !response.data.consumers) return;
    const consumers = response.data.consumers;

    for (const consumer of consumers) {
        if (!consumer.address) continue;
        try {
            await axiosInstance.get(`/consumer/${consumer.address}`);
        } catch (error) {
            log_error(`Error fetching consumer ${consumer.address}:`, error?.message);
        }
    }
};

const revalidateCacheForProviders = async () => {
    log(`RevalidateCache - ${new Date().toISOString()} - Revalidating cache for providers...`);
    const response = await retryAxiosGet('/providers');
    if (!response || !response.data.providers) return;
    const providers = response.data.providers;

    for (const provider of providers) {
        if (!provider.address) continue;
        try {
            await axiosInstance.get(`/provider/${provider.address}`);
        } catch (error) {
            log_error(`Error fetching provider ${provider.address}:`, error?.message);
        }
    }
};

let isRevalidating = false;

const revalidateCache = async () => {
    // If a revalidation is already in progress, don't start another one
    if (isRevalidating) {
        return;
    }

    // Set the flag to true to indicate that a revalidation is in progress
    isRevalidating = true;

    // Check if we're running on the client-side
    if (typeof window !== 'undefined') {
        throw new Error('This code should not be run on the client-side.');
    }

    try {
        log(`RevalidateCache - ${new Date().toISOString()} - Starting revalidation of cache...`);
        await revalidateCacheForSpecs();
        await revalidateCacheForConsumers();
        await revalidateCacheForProviders();
        log(`RevalidateCache - ${new Date().toISOString()} - Finished revalidation of cache.`);
    } catch (error) {
        log_error(`RevalidateCache - ${new Date().toISOString()} - Error during revalidation of cache:`, error);
    }

    // Set the flag to false to indicate that the revalidation has finished
    isRevalidating = false;
};

let isRevalidationLoopStarted = false;

const StartRevalidateCacheLoop = () => {
    revalidateCache();

    // If the revalidation loop has already started, don't start another one
    if (isRevalidationLoopStarted) {
        return;
    }

    // Set the flag to true to indicate that the revalidation loop has started
    isRevalidationLoopStarted = true;

    // Call revalidateCacheForData every 4-5 minutes
    setInterval(revalidateCache, 5 * 60 * 1000);
};

StartRevalidateCacheLoop();

export default async function handler(req, res) {
    StartRevalidateCacheLoop();
    res.status(200).send(logs.join('\n'));
}