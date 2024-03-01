// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@radix-ui/themes"],
  env: {
    REST_URL: process.env.REST_URL,
    REST_URL_CYBERTRON: process.env.REST_URL_CYBERTRON,
  },
};

module.exports = nextConfig;
