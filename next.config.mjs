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
  onDemandEntries: {
    maxInactiveAge: 1000,
  },
  env: {
    REST_URL: process.env.REST_URL,
  },
};

export default nextConfig;
