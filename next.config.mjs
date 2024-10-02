/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@radix-ui/themes"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lava-fe-assets.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    REST_URL: process.env.REST_URL,
    LOGO_URL: process.env.LOGO_URL,
    INFO_NETWORK: process.env.INFO_NETWORK,
    AXIOS_CACHE_TIMEOUT: process.env.AXIOS_CACHE_TIMEOUT,
    AXIOS_CACHE_TTL: process.env.AXIOS_CACHE_TTL,
    AXIOS_RETRY_COUNT: process.env.AXIOS_RETRY_COUNT,
    REST_LOGPUSH_URL: process.env.REST_LOGPUSH_URL,
    NEXT_PUBLIC_REST_URL: process.env.NEXT_PUBLIC_REST_URL,
    NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
    NEXT_PUBLIC_INFO_NETWORK: process.env.NEXT_PUBLIC_INFO_NETWORK,
    NEXT_PUBLIC_AXIOS_CACHE_TIMEOUT:
      process.env.NEXT_PUBLIC_AXIOS_CACHE_TIMEOUT,
    NEXT_PUBLIC_AXIOS_CACHE_TTL: process.env.NEXT_PUBLIC_AXIOS_CACHE_TTL,
    NEXT_PUBLIC_AXIOS_RETRY_COUNT: process.env.NEXT_PUBLIC_AXIOS_RETRY_COUNT,
    NEXT_PUBLIC_REST_LOGPUSH_URL: process.env.NEXT_PUBLIC_REST_LOGPUSH_URL,
  },
};

export default nextConfig;
