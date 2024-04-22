/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@radix-ui/themes"],
  images: {
    domains: ["lava-fe-assets.s3.amazonaws.com"],
  },
  env: {
    REST_URL: process.env.REST_URL,
  },
};

export default nextConfig;
