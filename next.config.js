// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@radix-ui/themes'],
  env: {
    REST_URL: process.env.REST_URL,
  }
};

module.exports = nextConfig;

